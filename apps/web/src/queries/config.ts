import { queryOptions } from "@tanstack/react-query";

import { getRPC } from "~/lib/rpc";

export const authConfigQueryOptions = queryOptions({
  queryKey: ["config", "auth"],
  queryFn: async ({ signal }) => getRPC().config.auth.query(undefined, { signal }),
});
