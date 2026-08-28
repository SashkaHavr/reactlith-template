import { Effect, Exit, Layer, Scope } from "effect";

import { BetterAuthServerClient } from "@reactlith-template/auth";
import { AuthConfig } from "@reactlith-template/config/auth-config";
import { DBConfig } from "@reactlith-template/config/db-config";
import { DrizzlePostgresClient } from "@reactlith-template/db";

const scope = Scope.makeUnsafe();

const acquireResources = Effect.gen(function* () {
  const db = yield* DrizzlePostgresClient;
  const auth = yield* BetterAuthServerClient;
  return { db, auth };
});

const context = await Effect.runPromise(
  BetterAuthServerClient.layerWithoutDependencies.pipe(
    Layer.provideMerge(
      DrizzlePostgresClient.layerWithoutDependencies.pipe(Layer.provide(DBConfig.layer)),
    ),
    Layer.provide(AuthConfig.layer),
    Layer.buildWithScope(scope),
  ),
);

export const resources = await Effect.runPromise(acquireResources.pipe(Effect.provide(context)));

export async function dispose() {
  await Effect.runPromise(Scope.close(scope, Exit.void));
}
