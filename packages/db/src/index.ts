import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { getEnvDB } from "@reactlith-template/env";

import { relations, schema } from "./relations";

export function createDB() {
  return drizzle({
    connection: getEnvDB().DATABASE_URL,
    relations: relations,
  });
}

export type DBType = ReturnType<typeof createDB>;

export async function checkDbReady(db: DBType) {
  await db.execute(sql`select 1`);
}

export { relations, schema };
