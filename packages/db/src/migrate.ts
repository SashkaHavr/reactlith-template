import { db } from "#index.ts";
import { migrateDb } from "#utils/migration.ts";

await migrateDb(db);
