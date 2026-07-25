import { createContext } from "unctx";

import type { AuthType } from "@reactlith-template/auth";
import type { IdBranded } from "@reactlith-template/db/id-branded";

const ctx = createContext<{ session: AuthType["$Infer"]["Session"]; userId: IdBranded<"user"> }>({
  asyncContext: true,
});

export function getUserContext() {
  return ctx.use();
}

export const callInUserContext = ctx.callAsync;
