import { drizzle } from "drizzle-orm/node-postgres";

import { relations, schema } from "./relations";
import { idBranded } from "./utils/id-branded";
import type { IdBranded, IdBrand } from "./utils/id-branded";

export function createDB(connectionString: string) {
  return drizzle({
    connection: { connectionString },
    relations: relations,
  });
}

export type DBType = ReturnType<typeof createDB>;

export { relations, schema, idBranded };
export type { IdBranded, IdBrand };
