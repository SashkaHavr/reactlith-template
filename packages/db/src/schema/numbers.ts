import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

import { user } from './auth';

export const number = pgTable('number', {
  id: serial().primaryKey(),
  number: integer().notNull(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});
