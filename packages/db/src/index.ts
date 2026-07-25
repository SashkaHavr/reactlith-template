import { drizzle } from "drizzle-orm/bun-sql";

import { getEnvDB } from "@reactlith-template/env";

import { relations, schema } from "./relations";

export function createDB() {
  return drizzle({
    connection: getEnvDB().DATABASE_URL,
    relations: relations,
  });
}

export type DBType = ReturnType<typeof createDB>;
export { relations, schema };
