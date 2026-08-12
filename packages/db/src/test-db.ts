import { PGlite } from "@electric-sql/pglite";
import { dataDir } from "@electric-sql/pglite-prepopulatedfs";
import { drizzle } from "drizzle-orm/pglite";
import { inject } from "vitest";

import { relations, schema } from "./relations";

declare module "vitest" {
  export interface ProvidedContext {
    pgliteDump: Uint8Array;
  }
}

function openTestDB(loadDataDir: Blob | File) {
  const client = new PGlite({ loadDataDir });
  const db = drizzle({ client, relations });

  return db;
}

export async function createTestDB() {
  const dump = inject("pgliteDump");
  const db = openTestDB(new Blob([Uint8Array.from(dump)]));

  await db.$client.waitReady;

  return db;
}

export async function createTestDBForDump() {
  const { pushSchema } = await import("drizzle-kit/api-postgres");
  const db = openTestDB(await dataDir());
  const { apply } = await pushSchema(schema, db);

  await apply();

  return db;
}

export type TestDBType = Awaited<ReturnType<typeof createTestDB>>;
