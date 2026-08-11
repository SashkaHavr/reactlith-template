import { AsyncLocalStorage } from "node:async_hooks";

import type { createContext as createTrpcContext } from "#context";

type TransactionContext = {
  tx: Parameters<Parameters<ReturnType<typeof createTrpcContext>["db"]["transaction"]>[0]>[0];
};

const storage = new AsyncLocalStorage<TransactionContext>();

export function getTransactionContext() {
  return storage.getStore();
}

export function callInTransactionContext<T>(context: TransactionContext, callback: () => T) {
  return storage.run(context, callback);
}
