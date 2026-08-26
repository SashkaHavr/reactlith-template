import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Effect, Redacted } from "effect";

import { DBConfig } from "@reactlith-template/services/db-config";

import { relations, schema } from "./relations";

export function createDB() {
  const config = Effect.runSync(DBConfig.make);

  return drizzle({
    connection: Redacted.value(config.databaseUrl),
    relations: relations,
  });
}

export type DBType = ReturnType<typeof createDB>;

export async function checkDbReady(db: DBType) {
  await db.execute(sql`select 1`);
}

export { relations, schema };
