import { createDB } from "#index.ts";
import { migrateDb } from "#utils/migration.ts";

const db = createDB();

await migrateDb(db);
