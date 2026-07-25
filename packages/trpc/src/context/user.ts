import { createContext } from "unctx";

import type { AuthType } from "@reactlith-template/auth";

const ctx = createContext<AuthType["$Infer"]["Session"]["user"]>({ asyncContext: true });

export function getUserContext() {
  return ctx.use();
}

export const callInUserContext = ctx.callAsync;
