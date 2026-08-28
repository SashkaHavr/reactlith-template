import { Panic } from "better-result";
import { describe, expect, it } from "vitest";

import { callInTransaction } from "#async-context/transaction";
import { setupRepoTest } from "#test-utils/repo";
import { schema } from "@reactlith-template/db";

import { UserNotFound } from "./errors";
import { userRepo } from "./repo";

const testContext = setupRepoTest();

describe("userRepo", () => {
  it("requires a transaction", async () => {
    const { userId } = testContext;

    const result = testContext.inUserContext(userId, userRepo.getUserLock);

    await expect(result).rejects.toThrow(Panic);
  });

  it("locks and returns the current user", async () => {
    const { userId } = testContext;

    const result = await testContext.inUserContext(userId, async () =>
      callInTransaction(userRepo.getUserLock),
    );

    expect(result.unwrap()).toMatchObject({ id: userId });
  });

  it("rejects a missing current user", async () => {
    const { userId } = testContext;
    await testContext.db.delete(schema.user);

    const result = await testContext.inUserContext(userId, async () =>
      callInTransaction(userRepo.getUserLock),
    );

    expect(result).toMatchObject({ error: expect.any(UserNotFound) });
  });
});
