import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { AuthType } from "@reactlith-template/auth";
import { auth } from "@reactlith-template/auth";
import { ac, roles } from "@reactlith-template/auth/permissions";

export const authClient = createAuthClient({
  basePath: "/auth",
  plugins: [inferAdditionalFields<AuthType>(), adminClient({ ac, roles })],
  fetchOptions: {
    throw: true,
  },
});

const getSession = createIsomorphicFn()
  .server(async () => await auth.api.getSession({ headers: getRequest().headers }))
  .client(async () => await authClient.getSession());

export const baseAuthKey = "auth" as const;

export const getSessionQueryOptions = queryOptions({
  queryKey: [baseAuthKey, "getSession"] as const,
  queryFn: async () => {
    try {
      const session = await getSession();
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
  },
});

export function useAuth() {
  return useRouteContext({ from: "__root__", select: (ctx) => ctx.auth });
}

export function useLoggedInAuth() {
  const auth = useAuth();
  if (!auth.loggedIn) {
    throw new Error("Auth is not defined");
  }
  return auth;
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
    onSettled: async () => {
      await resetAuth();
    },
  });
}
