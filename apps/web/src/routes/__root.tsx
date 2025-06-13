import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  Navigate,
  Outlet,
} from '@tanstack/react-router';

import { getAuthContext } from '~/lib/auth';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: () => <Navigate to="/" />,
  beforeLoad: async ({ context: { queryClient } }) => {
    return {
      auth: await getAuthContext(queryClient),
    };
  },
});

function RootComponent() {
  return <Outlet />;
}
