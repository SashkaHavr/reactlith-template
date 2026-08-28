import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import {
  createClientOnlyFn,
  createIsomorphicFn,
  getGlobalStartContext,
} from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient as createAuthClientBase } from "better-auth/react";

import type { AuthType } from "@reactlith-template/auth";
import { ac, roles } from "@reactlith-template/auth/permissions";

let _authClient: ReturnType<typeof createAuthClient> | undefined = undefined;
const createAuthClient = createClientOnlyFn(() =>
  createAuthClientBase({
    basePath: "/api/auth",
    plugins: [inferAdditionalFields<AuthType>(), adminClient({ ac, roles })],
    fetchOptions: {
      throw: true,
    },
  }),
);

export function getAuthClient() {
  return (_authClient ??= createAuthClient());
}

export const getSession = createIsomorphicFn()
  .server(async () =>
    resolveSession(
      await getGlobalStartContext()!.auth.api.getSession({ headers: getRequest().headers }),
    ),
  )
  .client(async () => resolveSession(await getAuthClient().getSession()));

function resolveSession<T>(session: T) {
  if (session === null || session === undefined) {
    return {
      loggedIn: false as const,
    };
  }
  return {
    loggedIn: true as const,
    ...session,
  };
}

export const baseAuthKey = "auth" as const;

export const getSessionQueryOptions = queryOptions({
  queryKey: [baseAuthKey, "getSession"] as const,
  queryFn: async () => await getSession(),
  staleTime: 5 * 60 * 1000,
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

export function useSignout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await queryClient.cancelQueries();
      await getAuthClient().signOut();
      await getAuthClient().getSession({ query: { disableCookieCache: true } });
      queryClient.clear();
      await router.invalidate();
    },
  });
}
