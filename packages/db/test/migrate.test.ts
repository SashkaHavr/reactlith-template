// oxlint-disable typescript/await-thenable
import { describe, expect, test } from "bun:test";
import fs from "fs/promises";
import { fileURLToPath } from "node:url";
import path from "path";

import { $ } from "bun";

const dbSrcFolder = fileURLToPath(new URL(".", import.meta.url));
const drizzleFolder = path.join(dbSrcFolder, "../drizzle");
const dbPackageFolder = path.join(dbSrcFolder, "..");

async function getDrizzleFolders() {
  return (await fs.readdir(drizzleFolder, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
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

describe("db migration tests", () => {
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
