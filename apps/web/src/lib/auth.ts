import type { QueryClient } from '@tanstack/react-query';
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
  adminClient,
  inferAdditionalFields,
  magicLinkClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from '@reactlith-template/auth';
import {
  getRoles,
  isRole,
  permissions,
} from '@reactlith-template/auth/permissions';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_UNDER_REVERSE_PROXY
    ? undefined
    : import.meta.env.VITE_API_URL,
  basePath: '/auth',
  plugins: [
    inferAdditionalFields<typeof auth>(),
    magicLinkClient(),
    adminClient(permissions),
  ],
  fetchOptions: { throw: true },
});

const authBaseKey = 'auth';

export const authGetSessionOptions = queryOptions({
  queryKey: [authBaseKey, 'getSession'],
  queryFn: async () => await authClient.getSession(),
});

export async function getAuthData(queryClient: QueryClient) {
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
        };
  } catch {
    return {
      available: false as const,
      isLoggedIn: false as const,
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

export function hasPermissions(
  user: typeof authClient.$Infer.Session.user,
  permissions: NonNullable<
    Parameters<typeof authClient.admin.checkRolePermission>[0]['permission']
  >,
) {
  return (
    isRole(user.role) &&
    authClient.admin.checkRolePermission({
      role: user.role,
      permissions: permissions,
    })
  );
}

export function hasAnyRoleExceptUser(
  user: typeof authClient.$Infer.Session.user,
) {
  const roles = getRoles(user.role);
  return roles && roles.filter((r) => r != 'user').length > 0;
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
