import { migrate as drizzleMigrate } from 'drizzle-orm/node-postgres/migrator';

import { db } from '#index.ts';

export async function migrate() {
  await drizzleMigrate(db, { migrationsFolder: './drizzle' });
}
