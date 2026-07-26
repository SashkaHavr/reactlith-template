import { describe, expect, it } from "vitest";

import { callInTransactionContext } from "#/async-context/transaction";
import { schema } from "@reactlith-template/db";

import { setupRepoTest } from "../../test-utils/repo";
import { userRepo } from "./repo";

type TransactionContext = Parameters<typeof callInTransactionContext>[0];

const testContext = setupRepoTest();

describe("userRepo", () => {
  it("requires a transaction", async () => {
    await expect(
      testContext.inUserContext(testContext.userId, userRepo.getUserLock),
    ).rejects.toThrow("getUserLock must be called within a transaction");
  });

  it("locks and returns the current user", async () => {
    await expect(
      testContext.db.transaction(async (tx) =>
        testContext.inUserContext(testContext.userId, async () =>
          callInTransactionContext({ tx } as unknown as TransactionContext, userRepo.getUserLock),
        ),
      ),
    ).resolves.toEqual({ id: testContext.userId });
  });

  it("rejects a missing current user", async () => {
    await testContext.db.delete(schema.user);

    await expect(
      testContext.db.transaction(async (tx) =>
        testContext.inUserContext(testContext.userId, async () =>
          callInTransactionContext({ tx } as unknown as TransactionContext, userRepo.getUserLock),
        ),
      ),
    ).rejects.toThrow("User not found");
  });
});
