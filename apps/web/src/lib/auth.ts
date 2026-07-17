import { RegistryContext, useAtomSet } from "@effect/atom-react";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { Duration, Effect, Schedule } from "effect";
import * as Atom from "effect/unstable/reactivity/Atom";
import { useContext } from "react";

import type { AuthType } from "@reactlith-template/auth";
import { ac, roles } from "@reactlith-template/auth/permissions";

export const authClient = createAuthClient({
  basePath: "/auth",
  plugins: [inferAdditionalFields<AuthType>(), adminClient({ ac, roles }), genericOAuthClient()],
  fetchOptions: {
    throw: true,
  },
});

const getSession = createIsomorphicFn()
  .server(
    async () =>
      await getGlobalStartContext()!.auth.api.getSession({ headers: getRequest().headers }),
  )
  .client(async () => await authClient.getSession());

export const sessionSourceAtom = Atom.make(
  Effect.tryPromise(async () => getSession()).pipe(
    Effect.retry({ schedule: Schedule.spaced(500), times: 20 }),
    Effect.map((session) => {
      if (session === null) {
        return { loggedIn: false as const };
      }
      return { loggedIn: true as const, ...session };
    }),
  ),
).pipe(Atom.keepAlive);

export const sessionAtom = sessionSourceAtom.pipe(
  Atom.swr({ staleTime: Duration.infinity, revalidateOnMount: false }),
);

const signInWithGoogleAtom = Atom.fn<{
  googleEmulate: boolean;
  callbackURL: string;
}>()(({ googleEmulate, callbackURL }) =>
  Effect.tryPromise(async () =>
    googleEmulate
      ? authClient.signIn.oauth2({ providerId: "google-emulate", callbackURL })
      : authClient.signIn.social({ provider: "google", callbackURL }),
  ),
);

const signoutAtom = Atom.fn(() => Effect.tryPromise(async () => authClient.signOut()));

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
  const atomRegistry = useContext(RegistryContext);
  const router = useRouter();

  return async () => {
    await authClient.getSession({ query: { disableCookieCache: true } });
    atomRegistry.reset();
    await router.invalidate();
  };
}

export function useSignout() {
  const resetAuth = useResetAuth();
  const signout = useAtomSet(signoutAtom, { mode: "promiseExit" });
  return async () => {
    await signout();
    await resetAuth();
  };
}

export function useSignInWithGoogle() {
  const resetAuth = useResetAuth();
  const signInWithGoogle = useAtomSet(signInWithGoogleAtom, { mode: "promiseExit" });
  return async (options: { googleEmulate: boolean; callbackURL: string }) => {
    await signInWithGoogle(options);
    await resetAuth();
  };
}
