import { timestamp, uuid } from "drizzle-orm/pg-core";
import type { Brand } from "effect";
import { v7 as uuidv7 } from "uuid";

export function baseTable<T extends string>() {
  return {
    id: uuid()
      .$type<Brand.Branded<string, T>>()
      .primaryKey()
      .$defaultFn(uuidv7 as () => Brand.Branded<string, T>),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
}
