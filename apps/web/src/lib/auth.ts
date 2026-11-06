import { RegistryContext, useAtomSet, useAtomValue } from "@effect/atom-react";
import { useRouter } from "@tanstack/react-router";
import {
  createClientOnlyFn,
  createIsomorphicFn,
  getGlobalStartContext,
} from "@tanstack/react-start";
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import type { AtomRegistry } from "effect/reactivity";
import { useContext } from "react";

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

type Session = ReturnType<
  typeof resolveSession<Awaited<ReturnType<ReturnType<typeof getAuthClient>["getSession"]>>>
>;

export const sessionAtom = Atom.make<
  { readonly value: Session; readonly updatedAt: number } | undefined
>(undefined).pipe(Atom.keepAlive);

export async function loadSession(registry: AtomRegistry.AtomRegistry) {
  const cached = registry.get(sessionAtom);
  if (cached !== undefined && Date.now() - cached.updatedAt < 5 * 60 * 1000) return cached.value;
  const session = resolveSession(await getAuthClient().getSession());
  registry.set(sessionAtom, { value: session, updatedAt: Date.now() });
  return session;
}

export function useSession() {
  const session = useAtomValue(sessionAtom)?.value;
  if (!session?.loggedIn) {
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

  return () => {
    void signout()
      .then(async () => {
        registry.reset();
        registry.preloadedSerializable.clear();
        await router.invalidate();
      })
      .catch(() => undefined);
  };
}
