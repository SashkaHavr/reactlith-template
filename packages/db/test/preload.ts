import { beforeAll, afterAll, afterEach } from "bun:test";

import { createTestDbMigrated, getTestDb, resetDB } from "./utils";

beforeAll(async () => {
  await createTestDbMigrated();
});

afterEach(async () => {
  await resetDB(getTestDb());
});

afterAll(async () => {
  await (await createTestDbMigrated()).$client.close();
});
