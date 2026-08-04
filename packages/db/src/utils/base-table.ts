import { timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import type * as z from "zod";

export function baseTable<T extends string>() {
  return {
    id: uuid()
      .$type<string & z.core.$brand<T>>()
      .primaryKey()
      .$defaultFn(uuidv7 as () => string & z.core.$brand<T>),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
}
