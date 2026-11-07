import { useAtomSet, useAtomSuspense } from "@effect/atom-react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Effect } from "effect";
import { AtomRegistry } from "effect/reactivity";

import { m } from "@reactlith-template/intl/messages";
import { GoogleIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { signInWithGoogleAtom } from "~/lib/auth";
import { authConfigAtom } from "~/queries/config";
import { numbersAbove50Atom } from "~/queries/numbers";

export const Route = createFileRoute("/_layout/")({
  beforeLoad: ({ context: { session } }) => {
    if (session.loggedIn) {
      throw redirect({ to: "/numbers" });
    }
  },
  loader: async ({ context: { registry }, abortController }) => {
    await Effect.runPromise(AtomRegistry.getResult(registry, numbersAbove50Atom), {
      signal: abortController.signal,
    });
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
