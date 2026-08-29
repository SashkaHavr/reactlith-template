import { queryOptions } from "@tanstack/react-query";
import { Effect } from "effect";

import { getApi } from "~/lib/api";

export const authConfigQueryOptions = queryOptions({
  queryKey: ["config", "auth"],
  queryFn: async ({ signal }) => {
    const api = await getApi();
    return await Effect.runPromise(api.config.auth(), { signal });
  },
});
