import { afterAll, beforeAll, beforeEach } from "bun:test";

import { callInAppContext } from "#async-context/app";
import { callInUserContext } from "#async-context/user";
import type { DBType } from "@reactlith-template/db";
import { schema } from "@reactlith-template/db";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import { createTestDB } from "@reactlith-template/db/test-db";

type AppContext = Parameters<typeof callInAppContext>[0];
type UserContext = Parameters<typeof callInUserContext>[0];

export function setupRepoTest() {
  let db: Awaited<ReturnType<typeof createTestDB>>;
  let userId: IdBranded<"user">;
  let otherUserId: IdBranded<"user">;

  beforeAll(async () => {
    db = await createTestDB();
  });

  beforeEach(async () => {
    await db.delete(schema.user);

    const users = await db
      .insert(schema.user)
      .values([
        { name: "Test User", email: "test@example.com" },
        { name: "Other User", email: "other@example.com" },
      ])
      .returning({ id: schema.user.id });

    if (!users[0] || !users[1]) {
      throw new Error("Failed to seed users");
    }

    userId = users[0].id;
    otherUserId = users[1].id;
  });

  afterAll(async () => {
    await db.$client.close();
  });

  return {
    get db() {
      return db;
    },
    get userId() {
      return userId;
    },
    get otherUserId() {
      return otherUserId;
    },
    async inUserContext<T>(id: IdBranded<"user">, callback: () => Promise<T>) {
      return callInAppContext({ db: db as unknown as DBType } as AppContext, async () =>
        callInUserContext({ userId: id } as UserContext, callback),
      );
    },
  };
}
