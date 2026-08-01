import { describe, expect, it } from "vitest";

import { callInTransactionContext } from "#/async-context/transaction";
import { schema } from "@reactlith-template/db";

import { setupRepoTest } from "../../test-utils/repo";
import { userRepo } from "./repo";

type TransactionContext = Parameters<typeof callInTransactionContext>[0];

const testContext = setupRepoTest();

describe("userRepo", () => {
  it("requires a transaction", async () => {
    const { userId } = testContext;

    const result = testContext.inUserContext(userId, userRepo.getUserLock);

    await expect(result).rejects.toThrow("getUserLock must be called within a transaction");
  });

  it("locks and returns the current user", async () => {
    const { userId } = testContext;

    const result = await testContext.db.transaction(async (tx) =>
      testContext.inUserContext(userId, async () =>
        callInTransactionContext({ tx } as unknown as TransactionContext, userRepo.getUserLock),
      ),
    );

    expect(result).toEqual({ id: userId });
  });

  it("rejects a missing current user", async () => {
    const { userId } = testContext;
    await testContext.db.delete(schema.user);

    const result = testContext.db.transaction(async (tx) =>
      testContext.inUserContext(userId, async () =>
        callInTransactionContext({ tx } as unknown as TransactionContext, userRepo.getUserLock),
      ),
    );

    await expect(result).rejects.toThrow("User not found");
  });
});
