import { RegistryContext, useAtomSet, useAtomSuspense } from "@effect/atom-react";
import { useRouter } from "@tanstack/react-router";
import {
  createClientOnlyFn,
  createIsomorphicFn,
  getGlobalStartContext,
} from "@tanstack/react-start";
import { Effect, Schema } from "effect";
import { AsyncResult, Atom } from "effect/reactivity";
import { useContext } from "react";

import { createAuthClient as createAuthClientBase } from "@reactlith-template/auth/client";

import { AppAtom } from "./atom";

const createAuthClient = createClientOnlyFn(() => createAuthClientBase());

let authClient: ReturnType<typeof createAuthClient> | undefined = undefined;

export const getAuthClient = createIsomorphicFn()
  .server(() => getGlobalStartContext()!.authClient)
  .client(() => (authClient ??= createAuthClient()));

function resolveSession(
  session: Awaited<ReturnType<ReturnType<typeof getAuthClient>["getSession"]>>,
) {
  if (session === null || session === undefined) {
    return {
      loggedIn: false as const,
    };
  }
  return {
    loggedIn: true as const,
    user: {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    },
  };
}

export const sessionAtom = Atom.make(() =>
  Effect.tryPromise(async () => resolveSession(await getAuthClient().getSession())),
).pipe(
  AppAtom.serializable({
    key: "auth/session",
    schema: AsyncResult.Schema({
      success: Schema.Union([
        Schema.Struct({ loggedIn: Schema.Literal(false) }),
        Schema.Struct({
          loggedIn: Schema.Literal(true),
          user: Schema.Struct({
            id: Schema.String,
            email: Schema.String,
            role: Schema.String.pipe(Schema.NullishOr),
          }),
        }),
      ]),
    }),
  }),
  Atom.keepAlive,
  Atom.swr({
    staleTime: "5 minutes",
    revalidateOnFocus: true,
    focusSignal: Atom.windowFocusSignal,
  }),
);

export function useSession() {
  const session = useAtomSuspense(sessionAtom).value;
  if (!session.loggedIn) {
    throw new Error("User is not logged in");
  }
  return session;
}

const signoutAtom = Atom.fn(() =>
  Effect.tryPromise(async () => {
    await getAuthClient().signOut();
    await getAuthClient().getSession({ query: { disableCookieCache: true } });
  }),
);

export function useSignout() {
  const registry = useContext(RegistryContext);
  const signout = useAtomSet(signoutAtom, { mode: "promise" });
  const router = useRouter();

  return async () => {
    await signout();
    registry.reset();
    registry.preloadedSerializable.clear();
    await router.invalidate();
  };
}

export const signInWithGoogleAtom = Atom.fn((googleEmulate: boolean) =>
  Effect.tryPromise(async () => {
    await getAuthClient().signIn.social({
      provider: googleEmulate ? "google-emulate" : "google",
      callbackURL: window.location.href,
    });
  }),
);
