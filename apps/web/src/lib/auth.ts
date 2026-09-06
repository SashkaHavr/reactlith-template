import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
  createClientOnlyFn,
  createIsomorphicFn,
  getGlobalStartContext,
} from "@tanstack/react-start";

import { createAuthClient as createAuthClientBase } from "@reactlith-template/auth/client";

const createAuthClient = createClientOnlyFn(() => createAuthClientBase());

let authClient: ReturnType<typeof createAuthClient> | undefined = undefined;

export const getAuthClient = createIsomorphicFn()
  .server(() => getGlobalStartContext()!.authClient)
  .client(() => (authClient ??= createAuthClient()));

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

export const getSessionQueryOptions = queryOptions({
  queryKey: ["auth", "getSession"] as const,
  queryFn: async () => resolveSession(await getAuthClient().getSession()),
  staleTime: 5 * 60 * 1000,
});

export function useSession() {
  const session = useQuery(getSessionQueryOptions);
  if (!session.data?.loggedIn) {
    throw new Error("User is not logged in");
  }
  return session.data;
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
