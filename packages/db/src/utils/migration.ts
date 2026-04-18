import fsSync from "fs";
import fs from "fs/promises";
import os from "os";
import path from "path";

import { Result } from "better-result";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/bun-sql/migrator";
import z from "zod";

async function foreachMigrationFileLine(
  action: (content: string) => string,
  migrationsFolder: string,
) {
  await Promise.all(
    (await fs.readdir(migrationsFolder, { withFileTypes: true })).map(async (dir) => {
      if (!dir.isDirectory()) return;
      const sqlMigrationFile = Bun.file(path.join(migrationsFolder, dir.name, "migration.sql"));
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

export async function migrateDb(
  db: { execute: (query: ReturnType<typeof sql>) => unknown },
  migrationsFolder = "./drizzle",
) {
  (
    await Result.tryPromise(async () => await db.execute(sql`select 1`), {
      retry: { times: 20, delayMs: 500, backoff: "constant" },
    })
  ).unwrap();

  if (!fsSync.existsSync(migrationsFolder)) return;

  const env = z
    .object({ DANGEROUSLY_FORCE_DB_MIGRATION: z.stringbool().default(false) })
    // oxlint-disable-next-line node/no-process-env
    .parse(process.env);

  if (env.DANGEROUSLY_FORCE_DB_MIGRATION) {
    await foreachMigrationFileLine((s) => `-- ${s}`, migrationsFolder);
  }

  await migrate(db as Parameters<typeof migrate>[0], { migrationsFolder });

  if (env.DANGEROUSLY_FORCE_DB_MIGRATION) {
    await foreachMigrationFileLine((s) => s.slice(3), migrationsFolder);
  }
}
