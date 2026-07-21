import { timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

import type { IdBrandedInternal } from "./id-branded";

export function baseTable<T extends string>() {
  return {
    id: uuid()
      .$type<IdBrandedInternal<T>>()
      .primaryKey()
      .$defaultFn(() => uuidv7() as IdBrandedInternal<T>),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
}
