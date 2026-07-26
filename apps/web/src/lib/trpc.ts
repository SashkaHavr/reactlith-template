import { environmentManager, QueryClient } from "@tanstack/react-query";
import { createServerOnlyFn, getGlobalStartContext } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  splitLink,
  TRPCClientError,
} from "@trpc/client";
import { createTRPCContext, createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { parseError } from "evlog";
import superjson from "superjson";

import { createLocalLink } from "@reactlith-template/trpc";
import type { TRPCRouter } from "@reactlith-template/trpc";

const getLocalLink = createServerOnlyFn(() => {
  return createLocalLink({ request: getRequest(), context: getGlobalStartContext()! });
});

export function createTRPCRouteContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
      queries: {
        // Do not refetch preloaded data on mount (30 seconds stale time)
        staleTime: 30000,
      },
    },
  });
  const trpcClient = createTRPCClient<TRPCRouter>({
    links: environmentManager.isServer()
      ? [getLocalLink()]
      : [
          splitLink({
            // uses the httpSubscriptionLink for subscriptions
            condition: (op) => op.type === "subscription",
            true: httpSubscriptionLink({
              transformer: superjson,
              url: `/trpc`,
            }),
            false: httpBatchLink({
              transformer: superjson,
              url: "/trpc",
            }),
          }),
        ],
  });
  const trpc = createTRPCOptionsProxy({
    client: trpcClient,
    queryClient: queryClient,
  });
  return { trpc, queryClient, trpcClient };
}

export type TRPCRouteContext = ReturnType<typeof createTRPCRouteContext>;
export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<TRPCRouter>();
type TRPCClientErrorInfered = TRPCClientError<TRPCRouter>;
export function parseTRPCError(error: any) {
  if (error instanceof TRPCClientError) {
    return parseError((error as TRPCClientErrorInfered).data?.evlogError);
  }
  return parseError(undefined);
}
