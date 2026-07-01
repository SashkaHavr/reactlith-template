import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "#relations.ts";
import { envDB } from "@reactlith-template/env/db";

export function createDB() {
  return drizzle({
    connection: {
      connectionString: envDB.DATABASE_URL,
    },
    relations: relations,
  });
}

export type DBType = ReturnType<typeof createDB>;
