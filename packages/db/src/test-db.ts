import { PGlite } from "@electric-sql/pglite";
import { pushSchema } from "drizzle-kit/api-postgres";
import { drizzle } from "drizzle-orm/pglite";

import { relations, schema } from "./relations";

export async function createTestDB() {
  const client = new PGlite();
  const db = drizzle({ client, relations });
  const { apply } = await pushSchema(schema, db);

  await apply();

  return db;
}

export type TestDBType = Awaited<ReturnType<typeof createTestDB>>;
