import { useAtomSuspense } from "@effect/atom-react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

import { GoogleIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { useSignInWithGoogle } from "~/lib/auth";
import { configGeneralAtom } from "~/queries";

export const Route = createFileRoute("/_layout/")({
  beforeLoad: ({ context: { auth } }) => {
    if (auth.loggedIn) {
      throw redirect({ to: "/numbers" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const t = useTranslations("index");

  const authConfig = useAtomSuspense(configGeneralAtom).value.auth;
  const signInWithGoogle = useSignInWithGoogle();

  return (
    <div className="max-w-80">
      {authConfig.google && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            void signInWithGoogle({
              googleEmulate: authConfig.googleEmulate,
              callbackURL: window.location.href,
            });
          }}
        >
          <GoogleIcon />
          <span>{t("sign-in-with-google")}</span>
        </Button>
      )}
    </div>
  );
}
