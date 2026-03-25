import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { UserIcon } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "use-intl";

import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select";
import { Spinner } from "~/components/ui/spinner";
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

  const authConfig = useSuspenseQuery(trpc.config.general.queryOptions());
  const resetAuth = useResetAuth();

  const [selectedTestUser, setSelectedTestUser] = useState<string>("0");
  const loginAsTestUser = useMutation({
    mutationFn: async ({ user }: { user: number }) => {
      await authClient.signIn.email({
        email: `user${user}@example.com`,
        password: `password${user}`,
      });
    },
    onSettled: async () => {
      await resetAuth();
    },
  });

  return (
    authConfig.isSuccess && (
      <div className="max-w-80">
        {authConfig.data.auth.testAuth && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() =>
                loginAsTestUser.mutate({
                  user: parseInt(selectedTestUser, 10),
                })
              }
              disabled={loginAsTestUser.isPending}
            >
              {loginAsTestUser.isPending && <Spinner />}
              <UserIcon />
              {t("login-with")}
            </Button>
            <Select
              value={selectedTestUser}
              onValueChange={(value) => {
                if (value) {
                  setSelectedTestUser(value);
                }
              }}
            >
              <SelectTrigger>
                <span>{`${t("test-user")} ${selectedTestUser}`}</span>
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 100 }).map((_, user) => (
                  <SelectItem key={`login-user-${user}`} value={user.toString()}>
                    {`${t("test-user")} ${user}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    )
  );
}
