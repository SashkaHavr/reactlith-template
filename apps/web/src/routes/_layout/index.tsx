import { useAtomSet, useAtomSuspense } from "@effect/atom-react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Effect } from "effect";
import { Atom } from "effect/reactivity";

import { m } from "@reactlith-template/intl/messages";
import { GoogleIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { readAtom } from "~/lib/atom";
import { getAuthClient } from "~/lib/auth";
import { authConfigAtom } from "~/queries/config";
import { numbersAbove50Atom } from "~/queries/numbers";

const signInWithGoogleAtom = Atom.fn((googleEmulate: boolean) =>
  Effect.tryPromise(async () => {
    await getAuthClient().signIn.social({
      provider: googleEmulate ? "google-emulate" : "google",
      callbackURL: window.location.href,
    });
  }),
);

export const Route = createFileRoute("/_layout/")({
  beforeLoad: ({ context: { session } }) => {
    if (session.loggedIn) {
      throw redirect({ to: "/numbers" });
    }
  },
  loader: async ({ context: { registry }, abortController }) => {
    await readAtom(registry, numbersAbove50Atom, abortController.signal);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const authConfig = useAtomSuspense(authConfigAtom).value;
  const numbersAbove50 = useAtomSuspense(numbersAbove50Atom).value;
  const signInWithGoogle = useAtomSet(signInWithGoogleAtom);

  return (
    <div className="flex max-w-80 flex-col gap-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signInWithGoogle(authConfig.googleEmulate)}
      >
        <GoogleIcon />
        <span>{m.example_signInWithGoogle()}</span>
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {m.example_numbersAbove50Count({ count: numbersAbove50.count })}
      </p>
    </div>
  );
}
