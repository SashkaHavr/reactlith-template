import { AsyncLocalStorage } from "node:async_hooks";

import { panic } from "better-result";

import type { createContext as createTrpcContext } from "#/context";

type AppContext = ReturnType<typeof createTrpcContext>;

const storage = new AsyncLocalStorage<AppContext>();

export function getAppContext() {
  const context = storage.getStore();
  if (!context) {
    panic("App context is not available");
  }
  return context;
}

export function callInAppContext<T>(context: AppContext, callback: () => T) {
  return storage.run(context, callback);
}
