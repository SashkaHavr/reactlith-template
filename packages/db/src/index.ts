import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "#relations.ts";

export function createDB(connectionString: string) {
  return drizzle({
    connection: { connectionString },
    relations: relations,
  });
}

export type DBType = ReturnType<typeof createDB>;

export { relations };
