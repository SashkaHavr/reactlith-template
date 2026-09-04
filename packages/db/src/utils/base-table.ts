import { sql } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";
import type { Brand } from "effect";

export function baseTable<T extends string>() {
  return {
    id: uuid()
      .$type<Brand.Branded<string, T>>()
      .primaryKey()
      .default(sql`uuidv7()`),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
}
