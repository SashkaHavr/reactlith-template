import { QueryClient } from "@tanstack/react-query";

export function createRouterContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Do not refetch preloaded data on mount (30 seconds stale time)
        staleTime: 30000,
      },
    },
  });
  return { queryClient };
}

export type RouterContext = ReturnType<typeof createRouterContext>;
