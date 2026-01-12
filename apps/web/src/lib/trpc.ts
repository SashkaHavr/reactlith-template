import { QueryClient } from "@tanstack/react-query";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createTRPCClient, httpBatchLink, httpSubscriptionLink, splitLink } from "@trpc/client";
import { createTRPCContext, createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";

import type { TRPCRouter } from "@reactlith-template/trpc";

import { createTrpcCaller } from "@reactlith-template/trpc";

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
    links: [
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

const trpcServerFnMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  return await next({
    context: {
      trpc: createTrpcCaller({ request: getRequest() }),
    },
  });
});

export const trpcServerFn = createServerFn().middleware([trpcServerFnMiddleware]);
