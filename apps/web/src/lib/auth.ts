import type { QueryClient } from '@tanstack/react-query';
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from '@reactlith-template/auth';
import { permissions } from '@reactlith-template/auth/permissions';

import { getSessionServerFn } from './auth-server';

export const authClient = createAuthClient({
  basePath: '/auth',
  plugins: [inferAdditionalFields<typeof auth>(), adminClient(permissions)],
  fetchOptions: { throw: true },
});

const authBaseKey = 'auth';

export const authGetSessionOptions = queryOptions({
  queryKey: [authBaseKey, 'getSession'],
  queryFn: async () => await getSessionServerFn(),
});

export async function getAuthContext(queryClient: QueryClient) {
  try {
    const session = await queryClient.ensureQueryData(authGetSessionOptions);
    return session !== null
      ? {
          available: true as const,
          loggedIn: true as const,
          session: session.session,
          user: session.user,
        }
      : {
          available: true as const,
          loggedIn: false as const,
        };
  } catch {
    return {
      available: false as const,
      loggedIn: false as const,
    };
  }
}

export function useResetAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return async () => {
    await authClient.getSession({ query: { disableCookieCache: true } });
    queryClient.clear();
    await router.invalidate();
  };
}

export function useSignout() {
  const resetAuth = useResetAuth();
  return useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: async () => {
      await resetAuth();
    },
  });
}
