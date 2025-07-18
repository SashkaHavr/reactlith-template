import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routerWithQueryClient } from '@tanstack/react-router-with-query';

import { createTRPCRouteContext, TRPCProvider } from './lib/trpc';
import { routeTree } from './routeTree.gen';

export function createRouter() {
  const trpcRouteContext = createTRPCRouteContext();

  const router = createTanStackRouter({
    context: { ...trpcRouteContext },
    routeTree,
    Wrap: (props) => {
      return (
        <TRPCProvider
          trpcClient={trpcRouteContext.trpcClient}
          queryClient={trpcRouteContext.queryClient}
        >
          {props.children}
        </TRPCProvider>
      );
    },
  });

  return routerWithQueryClient(router, trpcRouteContext.queryClient);
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
