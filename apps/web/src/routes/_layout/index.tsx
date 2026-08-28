import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { m } from "@reactlith-template/intl/messages";
import { GoogleIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { getAuthClient } from "~/lib/auth";
import { authConfigQueryOptions } from "~/queries/config";
import { numbersAbove50QueryOptions } from "~/queries/numbers";

export const Route = createFileRoute("/_layout/")({
  beforeLoad: ({ context: { auth } }) => {
    if (auth.loggedIn) {
      throw redirect({ to: "/numbers" });
    }
  },
  loader: async ({ context: { queryClient } }) => {
    await queryClient.query({ ...numbersAbove50QueryOptions, staleTime: "static" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const authConfig = useSuspenseQuery(authConfigQueryOptions).data;
  const numbersAbove50 = useSuspenseQuery(numbersAbove50QueryOptions).data;

  const signInWithGoogle = useMutation({
    mutationFn: async () => {
      if (authConfig.googleEmulate) {
        await getAuthClient().signIn.social({
          provider: "google-emulate",
          callbackURL: window.location.href,
        });
      } else {
        await getAuthClient().signIn.social({
          provider: "google",
          callbackURL: window.location.href,
        });
      }
    },
  });

  return (
    <div className="flex max-w-80 flex-col gap-3">
      {authConfig.google && (
        <Button variant="outline" className="w-full" onClick={() => signInWithGoogle.mutate()}>
          <GoogleIcon />
          <span>{m.example_signInWithGoogle()}</span>
        </Button>
      )}
      <p className="text-center text-sm text-muted-foreground">
        {m.example_numbersAbove50Count({ count: numbersAbove50.count })}
      </p>
    </div>
  );
}
