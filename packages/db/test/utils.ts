import { fileURLToPath } from "node:url";

import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { drizzle } from "drizzle-orm/pglite";
import { reset } from "drizzle-seed";

import { relations } from "#relations.ts";
import * as schema from "#schema/index.ts";
import { migrateDb } from "#utils/migration.ts";

export function createTestDb() {
  const client = new PGlite({ extensions: { pg_trgm } });
  return drizzle({ client, schema, relations, casing: "snake_case" });
}

let dbSaved: ReturnType<typeof createTestDb> | undefined;

export async function createTestDbMigrated() {
  if (dbSaved) {
    return dbSaved;
  }
  const db = createTestDb();
  dbSaved = db;
  await migrateDb(db, fileURLToPath(new URL("../drizzle/", import.meta.url)));
  return db;
}

export function getTestDb() {
  if (!dbSaved) {
    throw new Error("Test db doesn not exist");
  }
  return dbSaved;
}

export async function resetDB(db: ReturnType<typeof createTestDb>) {
  await reset(db, schema);
}
