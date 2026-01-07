import { auth } from "@reactlith-template/auth";
import type { AuthType } from "@reactlith-template/auth";
import type { QueryClient } from "@tanstack/react-query";

import { permissions } from "@reactlith-template/auth/permissions";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

const authServerFnMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  return await next({
    context: {
      auth: auth.api,
      headers: getRequest().headers,
    },
  });
});

const getSessionServerFn = createServerFn()
  .middleware([authServerFnMiddleware])
  .handler(async ({ context: { auth, headers } }) => {
    const session = await auth.getSession({ headers });
    return session ? { session: session.session, user: session.user } : null;
  });

export const authClient = createAuthClient({
  basePath: "/auth",
  plugins: [inferAdditionalFields<AuthType>(), adminClient(permissions)],
  fetchOptions: { throw: true },
});

const authBaseKey = "auth";

export const authGetSessionOptions = queryOptions({
  queryKey: [authBaseKey, "getSession"],
  queryFn: async () => await getSessionServerFn(),
});

export async function getAuthContext(queryClient: QueryClient) {
  try {
    const session = await queryClient.ensureQueryData(authGetSessionOptions);
    return session === null
      ? {
          available: true as const,
          loggedIn: false as const,
        }
      : {
          available: true as const,
          loggedIn: true as const,
          session: session.session,
          user: session.user,
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
    mutationFn: async () => await authClient.signOut(),
    onSuccess: async () => {
      await resetAuth();
    },
  });
}
