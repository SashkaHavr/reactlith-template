import { integer, snakeCase } from "drizzle-orm/pg-core";

import { baseTable } from "#utils/base-table";
import { oneToManyCascadeOnDelete } from "#utils/foreign-keys";

import { user } from "./auth";

export const number = snakeCase.table("number", {
  ...baseTable<"number">(),
  number: integer().notNull(),
  userId: oneToManyCascadeOnDelete(() => user.id),
});
