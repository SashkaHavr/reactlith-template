import { isServer, QueryClient } from "@tanstack/react-query";
import { createServerOnlyFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createTRPCClient, httpBatchLink, httpSubscriptionLink, splitLink } from "@trpc/client";
import { createTRPCContext, createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";

import type { TRPCRouter } from "@reactlith-template/trpc";

import { trpcHandler } from "@reactlith-template/trpc";

const trpcServerFetch = createServerOnlyFn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const serverRequest = getRequest();
  if (typeof input !== "string") {
    throw new TypeError("Only string input is supported in trpcServerFetch");
  }
  const response = await trpcHandler({
    request: new Request(new URL(input, new URL(serverRequest.url).origin), {
      ...init,
      headers: serverRequest.headers,
    }),
  });
  return response;
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
