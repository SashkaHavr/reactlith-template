import fs from "fs/promises";
import os from "os";
import path from "path";
import { parseArgs } from "util";

import { migrate } from "drizzle-orm/bun-sql/migrator";

import { db } from "#index.ts";

async function foreachMigrationFileLine(action: (content: string) => string) {
  await Promise.all(
    (await fs.readdir("./drizzle", { withFileTypes: true })).map(async (dir) => {
      if (!dir.isDirectory()) return;
      const sqlMigrationFile = Bun.file(path.join("./drizzle", dir.name, "migration.sql"));
      if (!(await sqlMigrationFile.exists())) return;
      const migration = await sqlMigrationFile.text();
      await sqlMigrationFile.write(
        migration
          .split(os.EOL)
          .map((s) => action(s))
          .join(os.EOL),
      );
    }),
  );
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      force: {
        type: "boolean",
        default: false,
      },
    },
    strict: true,
    allowPositionals: true,
  });

  if (values.force) {
    await foreachMigrationFileLine((s) => `-- ${s}`);
  }

  await migrate(db, { migrationsFolder: "./drizzle" });

  if (values.force) {
    await foreachMigrationFileLine((s) => s.slice(3));
  }
}

await main();
