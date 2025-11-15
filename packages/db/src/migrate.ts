import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { db } from '#index.ts';

async function main() {
  await migrate(db, { migrationsFolder: './drizzle' });
}

await main();
