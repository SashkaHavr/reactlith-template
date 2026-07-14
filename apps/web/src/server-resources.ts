import { Effect, Exit, Redacted, Scope } from "effect";

import { createAuth } from "@reactlith-template/auth";
import { createDB } from "@reactlith-template/db";
import { ConfigDB } from "@reactlith-template/services/config";
import * as Config from "@reactlith-template/services/layers/config";

const acquireResources = Effect.gen(function* () {
  const configDB = yield* ConfigDB;

  const db = yield* Effect.acquireRelease(
    Effect.sync(() => createDB(Redacted.value(configDB.URL))),
    (db) => Effect.promise(async () => db.$client.end()),
  );

  const auth = yield* Effect.sync(() => createAuth(db));

  return { db, auth };
});

const scope = await Effect.runPromise(Scope.make());

export const resources = await Effect.runPromise(
  acquireResources.pipe(Effect.provide(Config.layerConfigDB), Scope.provide(scope)),
);

export async function dispose() {
  await Effect.runPromise(Scope.close(scope, Exit.void));
}
