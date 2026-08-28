import {
  createClientOnlyFn,
  createIsomorphicFn,
  getGlobalStartContext,
} from "@tanstack/react-start";
import { createTRPCClient, httpLink } from "@trpc/client";

import type { TRPCRouter } from "@reactlith-template/rpc";

let _rpc: ReturnType<typeof createRPC> | undefined = undefined;
const createRPC = createClientOnlyFn(() =>
  createTRPCClient<TRPCRouter>({
    links: [
      httpLink({
        url: "/api/rpc",
      }),
    ],
  }),
);

export const getRPC = createIsomorphicFn()
  .server(() => getGlobalStartContext()!.rpc)
  .client(() => (_rpc ??= createRPC()));

export function matchError<T>(
  error: any,
  errorClass: (abstract new (...args: never[]) => T) & { name: string },
): error is { data: { resultError: T } } {
  if (errorClass.name === error["data"]["resultError"]["_tag"]) {
    return true;
  }
  return false;
}
