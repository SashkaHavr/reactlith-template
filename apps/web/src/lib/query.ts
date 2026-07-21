import { QueryClient } from "@tanstack/react-query";

import { Api } from "@reactlith-template/api/index";
import { createApiQueryUtils } from "@reactlith-template/utils/api-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Do not refetch preloaded data on mount (30 seconds stale time)
        staleTime: 30000,
      },
    },
  });
}

export const { api, apiClient, partialQueryKey, queryKey } = createApiQueryUtils(Api);
