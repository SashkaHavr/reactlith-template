import { createContext } from "unctx";

import type { createContext as createTrpcContext } from "#/context";

const ctx = createContext<ReturnType<typeof createTrpcContext>>({ asyncContext: true });

export function getAppContext() {
  return ctx.use();
}

export const callInAppContext = ctx.callAsync;
