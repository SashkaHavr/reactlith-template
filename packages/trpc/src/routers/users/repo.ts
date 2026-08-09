import { panic, Result } from "better-result";
import { eq } from "drizzle-orm";

import { getTransactionContext } from "#/async-context/transaction";
import { getUserContext } from "#/async-context/user";
import { schema } from "@reactlith-template/db";

import { UserNotFound } from "./errors";

async function getUserLock() {
  const { userId } = getUserContext();
  const transactionContext = getTransactionContext();

  if (!transactionContext) {
    panic("getUserLock must be called within a transaction");
  }

  const [user] = await transactionContext.tx
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .for("update");

  if (!user) {
    return Result.err(new UserNotFound({ userId }));
  }

  return Result.ok(user);
}

export const userRepo = {
  getUserLock,
};
