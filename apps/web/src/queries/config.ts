import { queryOptions } from "@tanstack/react-query";
import { Effect } from "effect";

import { getApiClient } from "~/lib/api";

export const authConfigQueryOptions = queryOptions({
  queryKey: ["config", "auth"],
  queryFn: async ({ signal }) => {
    return await Effect.runPromise(getApiClient().config.auth(), { signal });
  },
});
