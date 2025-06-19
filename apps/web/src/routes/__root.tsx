import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  Navigate,
  Outlet,
} from '@tanstack/react-router';

import { getAuthData } from '~/lib/auth';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: () => <Navigate to="/" />,
  beforeLoad: async ({ context: { queryClient } }) => {
    return {
      auth: await getAuthData(queryClient),
    };
  },
});

function RootComponent() {
  return <Outlet />;
}
