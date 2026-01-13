import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { AuthType } from "@reactlith-template/auth";

import { adminPluginOptions } from "@reactlith-template/auth/permissions";

import { useTRPC } from "./trpc";

export const authClient = createAuthClient({
  basePath: "/auth",
  plugins: [inferAdditionalFields<AuthType>(), adminClient(adminPluginOptions)],
  fetchOptions: { throw: true },
});

export function useAuth() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.auth.getSession.queryOptions()).data;
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
    onSuccess: async () => {
      await resetAuth();
    },
  });
}
