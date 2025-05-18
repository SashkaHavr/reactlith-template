import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import superjson from 'superjson';

import type { TRPCRouter } from '@reactlith-template/trpc';

export const queryClient = new QueryClient({});

export const trpcClient = createTRPCClient<TRPCRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: new URL('/trpc', import.meta.env.VITE_API_URL),
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy({
  client: trpcClient,
  queryClient: queryClient,
});
