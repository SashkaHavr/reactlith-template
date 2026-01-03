import { db } from "#index.ts";
import { migrate } from "drizzle-orm/bun-sql/migrator";

async function main() {
  await migrate(db, { migrationsFolder: "./drizzle" });
}

await main();
