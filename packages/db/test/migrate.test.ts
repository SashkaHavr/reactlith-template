// oxlint-disable typescript/await-thenable
import { describe, expect, test } from "bun:test";
import fs from "fs/promises";
import { fileURLToPath } from "node:url";
import path from "path";

import { $ } from "bun";
import { sql } from "drizzle-orm";

import type { db as dbType } from "#index.ts";
import { migrateDb } from "#utils/migration.ts";

import { createTestDb } from "./utils";

const dbSrcFolder = fileURLToPath(new URL(".", import.meta.url));
const drizzleFolder = path.join(dbSrcFolder, "../drizzle");
const dbPackageFolder = path.join(dbSrcFolder, "..");

async function getDrizzleFolders() {
  return (await fs.readdir(drizzleFolder, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .toSorted();
}

async function getMigrationFolders() {
  const migrationFolders = await Promise.all(
    (await getDrizzleFolders()).map(async (migrationFolder) => ({
      name: migrationFolder,
      hasMigrationFile: await Bun.file(
        path.join(drizzleFolder, migrationFolder, "migration.sql"),
      ).exists(),
    })),
  );

  return migrationFolders
    .filter((migrationFolder) => migrationFolder.hasMigrationFile)
    .map((migrationFolder) => migrationFolder.name)
    .toSorted();
}

async function removeNewMigrationFolders(existingMigrationFolders: string[]) {
  const existingMigrationFolderSet = new Set(existingMigrationFolders);
  const newMigrationFolders = (await getDrizzleFolders()).filter(
    (migrationFolder) => !existingMigrationFolderSet.has(migrationFolder),
  );

  await Promise.all(
    newMigrationFolders.map(
      async (migrationFolder) =>
        await fs.rm(path.join(drizzleFolder, migrationFolder), { force: true, recursive: true }),
    ),
  );
}

async function runMigrationFoldersOneByOne(
  db: typeof dbType,
  migrationsFolder: string,
  migrationFolders: string[],
  index = 0,
) {
  const migrationFolder = migrationFolders[index];
  if (!migrationFolder) return;

  await fs.cp(
    path.join(drizzleFolder, migrationFolder),
    path.join(migrationsFolder, migrationFolder),
    {
      recursive: true,
    },
  );

  await migrateDb(db, migrationsFolder);

  const migrationsCount = await db.$count(sql`drizzle.__drizzle_migrations`);
  expect(migrationsCount).toBe(index + 1);

  await runMigrationFoldersOneByOne(db, migrationsFolder, migrationFolders, index + 1);
}

describe("db migration tests", () => {
  test("runs migration files one by one", async () => {
    const migrationsFolder = await fs.mkdtemp(path.join("/tmp", "migration-test"));
    const db = createTestDb();

    try {
      const migrationFolders = await getMigrationFolders();
      await expect(
        runMigrationFoldersOneByOne(
          db as unknown as typeof dbType,
          migrationsFolder,
          migrationFolders,
        ),
      ).resolves.toBeUndefined();
    } finally {
      await db.$client.close();
      await fs.rm(migrationsFolder, { force: true, recursive: true });
    }
  });

  test("schema is up to date", async () => {
    const migrationFolders = await getDrizzleFolders();

    try {
      const output = await $`DATABASE_URL='test' bun db:generate`.cwd(dbPackageFolder).quiet();
      const outputString = `${output.stdout.toString()}\n${output.stderr.toString()}`;

      expect(outputString).toContain("No schema changes, nothing to migrate");
    } finally {
      await removeNewMigrationFolders(migrationFolders);
    }
  });
});
