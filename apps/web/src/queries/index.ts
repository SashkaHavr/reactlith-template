import { queryOptions } from "@tanstack/react-query";
import type { Effect } from "effect";

import { api, queryKey } from "./utils";
import type { ApiClient } from "./utils";

type HealthEffect = ReturnType<ApiClient["index"]["health"]>;
export function healthQueryOptions() {
  return queryOptions<Effect.Success<HealthEffect>, Effect.Error<HealthEffect>>({
    queryKey: queryKey("index", "health"),
    queryFn: async () => api((client) => client.index.health()),
  });
}
