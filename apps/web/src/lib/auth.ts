import type { QueryClient } from '@tanstack/react-query';
import { queryOptions } from '@tanstack/react-query';
import {
  inferAdditionalFields,
  magicLinkClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from '@reactlith-template/auth';

const authPath = '/auth';

export const authClient = createAuthClient({
  baseURL:
    import.meta.env.VITE_API_REVERSE_PROXY_PATH == undefined
      ? import.meta.env.VITE_API_URL
      : undefined,
  basePath:
    import.meta.env.VITE_API_REVERSE_PROXY_PATH == undefined
      ? authPath
      : import.meta.env.VITE_API_REVERSE_PROXY_PATH + authPath,
  plugins: [inferAdditionalFields<typeof auth>(), magicLinkClient()],
});

const authBaseKey = 'auth';

export const authGetSessionOptions = queryOptions({
  queryKey: [authBaseKey, 'getSession'],
  queryFn: async () => await authClient.getSession(),
});

export async function getAuthContext(queryClient: QueryClient) {
  const session = await queryClient.ensureQueryData(authGetSessionOptions);
  if (session.error != null) {
    return {
      available: false as const,
      isLoggedIn: false as const,
      session: null,
      user: null,
    };
  }
  const sessionData = session.data as typeof authClient.$Infer.Session | null;
  return sessionData != null
    ? {
        available: true as const,
        isLoggedIn: true as const,
        session: sessionData.session,
        user: sessionData.user,
      }
    : {
        available: true as const,
        isLoggedIn: false as const,
        session: null,
        user: null,
      };
}

export async function resetAuth(queryClient: QueryClient) {
  await queryClient.resetQueries({ queryKey: [authBaseKey] });
}
