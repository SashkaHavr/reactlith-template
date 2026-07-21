import { Effect, Exit, Layer, Redacted, Scope } from "effect";
import { HttpRouter, HttpServer } from "effect/unstable/http";

import * as Api from "@reactlith-template/api/node";
import { createAuth } from "@reactlith-template/auth";
import { createDB } from "@reactlith-template/db";
import { AuthConfig, ConfigDB, GoogleAuthConfig } from "@reactlith-template/services/config";
import * as Auth from "@reactlith-template/services/node/auth";
import * as Config from "@reactlith-template/services/node/config";
import * as DB from "@reactlith-template/services/node/db";

const acquireResources = Effect.gen(function* () {
  const configDB = yield* ConfigDB;
  const authConfig = yield* AuthConfig;
  const googleAuthConfig = yield* GoogleAuthConfig;

  const db = yield* Effect.acquireRelease(
    Effect.sync(() => createDB(Redacted.value(configDB.URL))),
    (db) => Effect.promise(async () => db.$client.end()),
  );

  const auth = yield* Effect.sync(() =>
    createAuth(
      db,
      {
        secret: authConfig.SECRET ? Redacted.value(authConfig.SECRET) : undefined,
        hosts: authConfig.HOSTS,
      },
      {
        clientId: googleAuthConfig.CLIENT_ID,
        clientSecret: Redacted.value(googleAuthConfig.CLIENT_SECRET),
        emulateUrl: googleAuthConfig.EMULATE_URL,
      },
    ),
  );
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
