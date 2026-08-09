import { QueryClient } from "@tanstack/react-query";
import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createTRPCClient, httpBatchLink, httpSubscriptionLink, splitLink } from "@trpc/client";
import { createTRPCContext, createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import type { TRPCRouter } from "@reactlith-template/trpc";
import { createLocalLink } from "@reactlith-template/trpc";

const getLinks = createIsomorphicFn()
  .server(() => [createLocalLink({ request: getRequest(), context: getGlobalStartContext()! })])
  .client(() => [
    splitLink({
      condition: (op) => op.type === "subscription",
      true: httpSubscriptionLink({
        url: "/api/trpc",
      }),
      false: httpBatchLink({
        url: "/api/trpc",
      }),
    }),
  ]);

export function createTRPCRouteContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Do not refetch preloaded data on mount (30 seconds stale time)
        staleTime: 30000,
      },
    },
  });
  const trpcClient = createTRPCClient<TRPCRouter>({
    links: getLinks(),
  });
  const trpc = createTRPCOptionsProxy({
    client: trpcClient,
    queryClient: queryClient,
  });
  return { trpc, queryClient, trpcClient };
}

export type TRPCRouteContext = ReturnType<typeof createTRPCRouteContext>;
export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<TRPCRouter>();
export function matchError<T>(
  error: any,
  errorClass: (abstract new (...args: never[]) => T) & { name: string },
): error is { data: { resultError: T } } {
  if (errorClass.name === error["data"]["resultError"]["_tag"]) {
    return true;
  }
  return false;
}
