import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "#relations.ts";
import { envDB } from "@reactlith-template/env/db";

import * as schema from "./schema";

export const db = drizzle({
  connection: envDB.DATABASE_URL,
  schema: schema,
  relations: relations,
  casing: "snake_case",
});
