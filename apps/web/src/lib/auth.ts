import type { QueryClient } from '@tanstack/react-query';
import { queryOptions, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
  inferAdditionalFields,
  magicLinkClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from '@reactlith-template/auth';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_UNDER_REVERSE_PROXY
    ? undefined
    : import.meta.env.VITE_API_URL,
  basePath: '/auth',
  plugins: [inferAdditionalFields<typeof auth>(), magicLinkClient()],
  fetchOptions: { throw: true },
});

const authBaseKey = 'auth';

export const authGetSessionOptions = queryOptions({
  queryKey: [authBaseKey, 'getSession'],
  queryFn: async () => await authClient.getSession(),
});

export async function getAuthContext(queryClient: QueryClient) {
  try {
    const session = await queryClient.ensureQueryData(authGetSessionOptions);
    const sessionData = session as typeof authClient.$Infer.Session | null;
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
  } catch {
    return {
      available: false as const,
      isLoggedIn: false as const,
      session: null,
      user: null,
    };
  }
}

export function useResetAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return async () => {
    await queryClient.resetQueries({ queryKey: [authBaseKey] });
    await router.invalidate();
  };
}
