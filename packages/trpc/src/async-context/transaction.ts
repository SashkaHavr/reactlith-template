import { createContext } from "unctx";

import type { createContext as createTrpcContext } from "#/context";

const ctx = createContext<{
  tx: Parameters<Parameters<ReturnType<typeof createTrpcContext>["db"]["transaction"]>[0]>[0];
}>({ asyncContext: true });

export function getTransactionContext() {
  return ctx.tryUse();
}

export const callInTransactionContext = ctx.callAsync;
