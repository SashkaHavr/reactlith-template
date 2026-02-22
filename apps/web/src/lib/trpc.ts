import { isServer, QueryClient } from "@tanstack/react-query";
import { createServerOnlyFn } from "@tanstack/react-start";
import { createTRPCClient, httpBatchLink, httpSubscriptionLink, splitLink } from "@trpc/client";
import { createTRPCContext, createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";

import type { TRPCRouter } from "@reactlith-template/trpc";
import { trpcHandler } from "@reactlith-template/trpc";
import { createSSRRequest } from "~/utils/create-ssr-request";

import { baseAuthKey } from "./auth";

const trpcServerFetch = createServerOnlyFn(
  async (input: RequestInfo | URL, init?: RequestInit) =>
    await trpcHandler({
      request: createSSRRequest(input, init),
    }),
);

export function createTRPCRouteContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
      queries: {
        // Do not refetch preloaded data on mount (30 seconds stale time)
        staleTime: 30000,
      },
      mutations: {
        onSettled: async (data, error, variables, onMutateResult, context) => {
          // Invalidate all queries except auth-related by default after mutations
          await context.client.invalidateQueries({
            predicate: (query) => query.queryKey.length > 0 && query.queryKey[0] !== baseAuthKey,
          });
        },
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
          // Custom fetch implementation to support server-side requests
          fetch: isServer ? trpcServerFetch : undefined,
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
