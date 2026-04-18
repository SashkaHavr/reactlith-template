import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

import { Button } from "~/components/ui/button";
import { authClient, useResetAuth } from "~/lib/auth";
import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/_layout/")({
  beforeLoad: ({ context: { auth } }) => {
    if (auth.loggedIn) {
      throw redirect({ to: "/numbers" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const t = useTranslations("index");

  const authConfig = useSuspenseQuery(trpc.config.general.queryOptions()).data.auth;
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
    onSettled: async () => {
      await resetAuth();
    },
  });

  return (
    <div className="max-w-80">
      {authConfig.google && (
        <Button variant="outline" className="w-full" onClick={() => signInWithGoogle.mutate()}>
          {/* <img className="object-contain" src={googleIconSrc} alt="Google" /> */}
          <span>{t("sign-in-with-google")}</span>
        </Button>
      )}
    </div>
  );
}
