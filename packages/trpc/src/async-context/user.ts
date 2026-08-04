import { AsyncLocalStorage } from "node:async_hooks";

import type { AuthType } from "@reactlith-template/auth";
import type { IdBranded } from "@reactlith-template/db/id-branded";

type UserContext = { session: AuthType["$Infer"]["Session"]; userId: IdBranded<"user"> };

const storage = new AsyncLocalStorage<UserContext>();

export function getUserContext() {
  const context = storage.getStore();
  if (!context) {
    throw new Error("User context is not available");
  }
  return context;
}

export function callInUserContext<T>(context: UserContext, callback: () => T) {
  return storage.run(context, callback);
}
