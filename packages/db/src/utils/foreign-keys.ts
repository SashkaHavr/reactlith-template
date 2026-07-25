import type { pgTable } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import type z from "zod";

import type { baseTable } from "./base-table";

type ForeignKeyColumn<T extends string> = ReturnType<
  typeof pgTable<string, ReturnType<typeof baseTable<T>>>
>["id"];

export function oneToManyCascadeOnDelete<T extends string>(column: () => ForeignKeyColumn<T>) {
  return uuid()
    .$type<string & z.core.$brand<T>>()
    .notNull()
    .references(column, { onDelete: "cascade" });
}

export function oneToMany<T extends string>(column: () => ForeignKeyColumn<T>) {
  return uuid()
    .$type<string & z.core.$brand<T>>()
    .notNull()
    .references(column, { onDelete: "restrict" });
}

export function oneToManyNullable<T extends string>(column: () => ForeignKeyColumn<T>) {
  return uuid().$type<string & z.core.$brand<T>>().references(column, { onDelete: "set null" });
}

export function oneToOne<T extends string>(column: () => ForeignKeyColumn<T>) {
  return uuid()
    .$type<string & z.core.$brand<T>>()
    .notNull()
    .unique()
    .references(column, { onDelete: "cascade" });
}
