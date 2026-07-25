import { drizzle } from "drizzle-orm/node-postgres";

import { getEnvDB } from "@reactlith-template/env";

import { relations, schema } from "./relations";

export function createDB() {
  return drizzle({
    connection: { connectionString: getEnvDB().DATABASE_URL },
    relations: relations,
  });
}

export type DBType = ReturnType<typeof createDB>;
export { relations, schema };
