import { integer, snakeCase } from "drizzle-orm/pg-core";

import { baseTable } from "#utils/base-table.ts";
import { oneToManyCascadeOnDelete } from "#utils/foreign-keys.ts";

import { user } from "./auth";

export const number = snakeCase.table("number", {
  ...baseTable<"number">(),
  number: integer().notNull(),
  userId: oneToManyCascadeOnDelete(() => user.id),
});
