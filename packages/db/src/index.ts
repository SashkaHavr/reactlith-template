import { drizzle } from "drizzle-orm/bun-sql";

import { relations } from "#relations.ts";
import { envDB } from "@reactlith-template/env/db";

export const db = drizzle({
  connection: {
    url: envDB.DATABASE_URL,
  },
  relations: relations,
});
