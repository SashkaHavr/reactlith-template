import type { pgTable } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import type { Brand } from "effect";

import type { baseTable } from "./base-table";

type ForeignKeyColumn<T extends string> = ReturnType<
  typeof pgTable<string, ReturnType<typeof baseTable<T>>>
>["id"];

export function oneToManyCascadeOnDelete<T extends string>(column: () => ForeignKeyColumn<T>) {
  return uuid()
    .$type<Brand.Branded<string, T>>()
    .notNull()
    .references(column, { onDelete: "cascade" });
}

export function oneToMany<T extends string>(column: () => ForeignKeyColumn<T>) {
  return uuid()
    .$type<Brand.Branded<string, T>>()
    .notNull()
    .references(column, { onDelete: "restrict" });
}

export function oneToManyNullable<T extends string>(column: () => ForeignKeyColumn<T>) {
  return uuid().$type<Brand.Branded<string, T>>().references(column, { onDelete: "set null" });
}

export function oneToOne<T extends string>(column: () => ForeignKeyColumn<T>) {
  return uuid()
    .$type<Brand.Branded<string, T>>()
    .notNull()
    .unique()
    .references(column, { onDelete: "cascade" });
}
