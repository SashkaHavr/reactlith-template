import { eq } from "drizzle-orm";

import { getTransactionContext } from "#/async-context/transaction";
import { getUserContext } from "#/async-context/user";
import { schema } from "@reactlith-template/db";

import { userErrors } from "./errors";

async function getUserLock() {
  const { userId } = getUserContext();
  const transactionContext = getTransactionContext();

  if (!transactionContext) {
    throw new Error("getUserLock must be called within a transaction");
  }

  const [user] = await transactionContext.tx
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .for("update");

  if (!user) {
    throw userErrors.NOT_FOUND();
  }

  return user;
}

export const userRepo = {
  getUserLock,
};
