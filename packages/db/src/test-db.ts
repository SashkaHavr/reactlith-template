import { PGlite } from "@electric-sql/pglite";
import { dataDir } from "@electric-sql/pglite-prepopulatedfs";
import { drizzle } from "drizzle-orm/pglite";

import { relations, schema } from "./relations";

let dump: ArrayBuffer | undefined;

function openTestDB(loadDataDir: Blob) {
  const client = new PGlite({ loadDataDir });
  const db = drizzle({ client, relations });

  return db;
}

export async function createTestDB() {
  dump ??= await createTestDBDump();
  const db = openTestDB(new Blob([dump]));

  await db.$client.waitReady;

  return db;
}

async function createTestDBDump() {
  const { pushSchema } = await import("drizzle-kit/api-postgres");
  const db = openTestDB(await dataDir());
  try {
    const { apply } = await pushSchema(schema, db);
    await apply();

    const dump = await db.$client.dumpDataDir("none");
    return await dump.arrayBuffer();
  } finally {
    await db.$client.close();
  }
}

export type TestDBType = Awaited<ReturnType<typeof createTestDB>>;
