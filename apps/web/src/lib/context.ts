import { DbClient } from "@tanstack/react-db";
import { QueryClient } from "@tanstack/react-query";
export function createRouterContext() {
  const queryClient = new QueryClient();
  const dbClient = new DbClient({ queryClient });
  return { queryClient, dbClient };
}

export type RouterContext = ReturnType<typeof createRouterContext>;
