import type { TestProject } from "vite-plus/test/node";

import { createTestDBForDump } from "./packages/db/src/test-db";

export async function setup(project: TestProject) {
  const db = await createTestDBForDump();
  try {
    const dump = await db.$client.dumpDataDir("none");
    project.provide("pgliteDump", await dump.arrayBuffer());
  } finally {
    await db.$client.close();
  }
}
