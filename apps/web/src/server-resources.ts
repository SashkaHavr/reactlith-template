import { Effect, Exit, Layer, Redacted, Scope } from "effect";
import { HttpRouter, HttpServer } from "effect/unstable/http";

import * as Api from "@reactlith-template/api/layers";
import { createAuth } from "@reactlith-template/auth";
import { createDB } from "@reactlith-template/db";
import * as Auth from "@reactlith-template/services-layers/auth";
import * as Config from "@reactlith-template/services-layers/config";
import * as DB from "@reactlith-template/services-layers/db";
import { AuthConfig, ConfigDB, GoogleAuthConfig } from "@reactlith-template/services/config";

const acquireResources = Effect.gen(function* () {
  const configDB = yield* ConfigDB;
  const authConfig = yield* AuthConfig;
  const googleAuthConfig = yield* GoogleAuthConfig;

  const db = yield* Effect.acquireRelease(
    Effect.sync(() => createDB(Redacted.value(configDB.URL))),
    (db) => Effect.promise(async () => db.$client.end()),
  );

  const auth = yield* Effect.sync(() => createAuth(db, authConfig, googleAuthConfig));
  const { handler: apiHandler } = yield* Effect.acquireRelease(
    Effect.sync(() =>
      HttpRouter.toWebHandler(
        Api.layer.pipe(
          Layer.provide(DB.layerWithDefaults),
          Layer.provide(DB.pgClientLayerFromDrizzle(db)),
          Layer.provide(Auth.layerFromBetterAuth(auth.api)),
          Layer.provide(Layer.succeed(GoogleAuthConfig, googleAuthConfig)),
          Layer.provide(HttpServer.layerServices),
          Layer.provide(HttpRouter.disableLogger),
        ),
      ),
    ),
    ({ dispose }) => Effect.promise(dispose),
  );

  return { db, auth, apiHandler };
});

const scope = await Effect.runPromise(Scope.make());

export const resources = await Effect.runPromise(
  acquireResources.pipe(
    Effect.provide([
      Config.layerConfigDB,
      Config.layerGoogleAuthConfig,
      Config.layerAuthConfig.pipe(Layer.provide(Config.layerConfigNode)),
    ]),
    Scope.provide(scope),
  ),
);

export async function dispose() {
  await Effect.runPromise(Scope.close(scope, Exit.void));
}
