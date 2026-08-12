import { AsyncLocalStorage } from "node:async_hooks";

import type { DBType } from "@reactlith-template/db";

import { getAppContext } from "./app";

type TransactionContext = {
  tx: Parameters<Parameters<DBType["transaction"]>[0]>[0];
};

const storage = new AsyncLocalStorage<TransactionContext>();

export function getTransactionContext() {
  return storage.getStore();
}

export async function callInTransaction<T>(callback: () => Promise<T>) {
  if (getTransactionContext()) {
    return await callback();
  }

  const { db } = getAppContext();
  return await db.transaction(async (tx) => {
    return await storage.run({ tx }, callback);
  });
}
