import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import superjson from 'superjson';

import type { TRPCRouter } from '@reactlith-template/trpc';
import { envExpo } from '@reactlith-template/env/expo';

import { authClient } from './auth';

export const queryClient = new QueryClient({});

export const trpcClient = createTRPCClient<TRPCRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: new URL('/trpc', envExpo.EXPO_PUBLIC_API_URL),
      headers() {
        const headers = new Map<string, string>();
        const cookies = authClient.getCookie();
        if (cookies) {
          headers.set('Cookie', cookies);
        }
        return Object.fromEntries(headers);
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy({
  client: trpcClient,
  queryClient: queryClient,
});
