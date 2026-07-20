import { QueryClient } from "@tanstack/react-query";

import { Api } from "@reactlith-template/api/index";
import { createApiQueryUtils } from "@reactlith-template/utils/api-query";

import { baseAuthKey } from "./auth";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
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
}

export const { api, apiClient, partialQueryKey, queryKey } = createApiQueryUtils(Api);
