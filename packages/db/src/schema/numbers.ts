import { baseTable } from "#utils/base-table.ts";
import { oneToManyCascadeOnDelete } from "#utils/foreign-keys.ts";
import { integer, pgTable } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const number = pgTable("number", {
  ...baseTable,
  number: integer().notNull(),
  userId: oneToManyCascadeOnDelete(() => user.id),
});
