import {
  environmentManager,
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import {
  createIsomorphicFn,
  createServerOnlyFn,
  getGlobalStartContext,
} from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { AuthType } from "@reactlith-template/auth";
import { ac, roles } from "@reactlith-template/auth/permissions";

export const authClient = createAuthClient({
  basePath: "/auth",
  plugins: [inferAdditionalFields<AuthType>(), adminClient({ ac, roles }), genericOAuthClient()],
  fetchOptions: {
    throw: true,
  },
});

const getServerAuthApi = createServerOnlyFn(() => {
  return getGlobalStartContext()?.auth.api!;
});

const getSession = createIsomorphicFn()
  .server(async () => await getServerAuthApi().getSession({ headers: getRequest().headers }))
  .client(async () => await authClient.getSession());

export const baseAuthKey = "auth" as const;

function toAuth(session: Awaited<ReturnType<typeof getSession>>) {
  if (session === null) {
    return {
      loggedIn: false as const,
    };
  }
  return {
    loggedIn: true as const,
    ...session,
  };
}

export const getSessionQueryOptions = queryOptions({
  queryKey: [baseAuthKey, "getSession"] as const,
  queryFn: async () => toAuth(await getSession()),
  retry: environmentManager.isServer() ? false : 1,
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: environmentManager.isServer() ? false : "always",
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
    const session = await authClient.getSession({ query: { disableCookieCache: true } });
    const auth = toAuth(session);
    queryClient.setQueryData(getSessionQueryOptions.queryKey, auth);
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== baseAuthKey,
    });
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
