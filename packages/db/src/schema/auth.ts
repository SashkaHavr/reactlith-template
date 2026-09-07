import { snakeCase, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

import { baseTable } from "#utils/base-table";
import { oneToManyCascadeOnDelete } from "#utils/foreign-keys";

export const user = snakeCase.table("user", {
  ...baseTable<"user">(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  image: text(),
  role: text(),
  banned: boolean().default(false),
  banReason: text(),
  banExpires: timestamp({ withTimezone: true }),
});

export const session = snakeCase.table(
  "session",
  {
    ...baseTable<"session">(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    userId: oneToManyCascadeOnDelete(() => user.id),
    impersonatedBy: text(),
  },
  (table) => [index().on(table.userId)],
);

export const account = snakeCase.table(
  "account",
  {
    ...baseTable<"account">(),
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

export const verification = snakeCase.table(
  "verification",
  {
    ...baseTable<"verification">(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [index().on(table.identifier)],
);
