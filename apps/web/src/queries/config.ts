import { queryOptions } from "@tanstack/react-query";
import { Effect } from "effect";

import { getRPC } from "~/lib/rpc";

export const authConfigQueryOptions = queryOptions({
  queryKey: ["config", "auth"],
  queryFn: async ({ signal }) => {
    const rpc = await getRPC();
    return await Effect.runPromise(rpc["config.auth"](), { signal });
  },
});
