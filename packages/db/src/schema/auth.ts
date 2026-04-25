import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { baseTable } from "#utils/base-table.ts";
import { oneToManyCascadeOnDelete } from "#utils/foreign-keys.ts";

export const user = pgTable(
  "user",
  {
    ...baseTable,
    name: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: boolean().default(false).notNull(),
    image: text(),
    role: text(),
    banned: boolean(),
    banReason: text(),
    banExpires: timestamp({ withTimezone: true }),
  },
  (table) => [index().on(table.email)],
);

export const session = pgTable(
  "session",
  {
    ...baseTable,
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    userId: oneToManyCascadeOnDelete(() => user.id),
    impersonatedBy: text(),
  },
  (table) => [index().on(table.userId), index().on(table.token)],
);

export const account = pgTable(
  "account",
  {
    ...baseTable,
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: oneToManyCascadeOnDelete(() => user.id),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
  },
  (table) => [index().on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    ...baseTable,
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [index().on(table.identifier)],
);
