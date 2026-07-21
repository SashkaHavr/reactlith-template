import { drizzle } from "drizzle-orm/node-postgres";

import { relations, schema } from "./relations";

export function createDB(connectionString: string) {
  return drizzle({
    connection: { connectionString },
    relations: relations,
  });
}

export type DBType = ReturnType<typeof createDB>;

export { relations, schema };
