import { PgliteClient } from "@effect/sql-pglite";
import { PGlite } from "@electric-sql/pglite";
import { dataDir } from "@electric-sql/pglite-prepopulatedfs";
import * as PgliteDrizzle from "drizzle-orm/effect-pglite";
import { drizzle } from "drizzle-orm/pglite";
import { Effect, Layer } from "effect";
import { inject } from "vitest";

import { Database } from "./index";
import { relations, schema } from "./relations";

declare module "vitest" {
  export interface ProvidedContext {
    pgliteDump: ArrayBuffer;
  }
}

function openTestDB(loadDataDir: Blob) {
  const client = new PGlite({ loadDataDir });
  return drizzle({ client, relations });
}

const PgliteClientLive = PgliteClient.layerFrom(
  Effect.gen(function* () {
    const db = yield* Effect.acquireRelease(
      Effect.sync(() => openTestDB(new Blob([inject("pgliteDump")]))),
      (db) => Effect.promise(async () => db.$client.close()),
    );
    return yield* PgliteClient.fromClient({
      liveClient: db.$client,
    });
  }),
);

export const DatabaseTest = Layer.effect(
  Database,
  // @ts-expect-error Test db, both use drizzle postgres
  PgliteDrizzle.makeWithDefaults({ relations }),
).pipe(Layer.provide(PgliteClientLive));

export async function createTestDBForDump() {
  const { pushSchema } = await import("drizzle-kit/api-postgres");
  const db = openTestDB(await dataDir());
  const { apply } = await pushSchema(schema, db);

  await apply();

  return db;
}
