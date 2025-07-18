import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

import { getAuthContext } from '~/lib/auth';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  beforeLoad: async ({ context: { queryClient } }) => {
    return {
      auth: await getAuthContext(queryClient),
    };
  },
});

function RootComponent() {
  return <Outlet />;
}
