import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { m } from "@reactlith-template/intl/messages";
import { GoogleIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { authClient, useResetAuth } from "~/lib/auth";
import { api } from "~/lib/query";

export const Route = createFileRoute("/_layout/")({
  beforeLoad: ({ context: { auth } }) => {
    if (auth.loggedIn) {
      throw redirect({ to: "/numbers" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const authConfig = useSuspenseQuery(api.index.configGeneral.queryOptions()).data.auth;
  const resetAuth = useResetAuth();
  const signInWithGoogle = useMutation({
    mutationFn: async () => {
      if (authConfig.googleEmulate) {
        await authClient.signIn.oauth2({
          providerId: "google-emulate",
          callbackURL: window.location.href,
        });
      } else {
        await authClient.signIn.social({ provider: "google", callbackURL: window.location.href });
      }
    },
    onSettled: resetAuth,
  });

  return (
    <div className="max-w-80">
      {authConfig.google && (
        <Button variant="outline" className="w-full" onClick={() => signInWithGoogle.mutate()}>
          <GoogleIcon />
          <span>{m.sign_in_with_google()}</span>
        </Button>
      )}
    </div>
  );
}
