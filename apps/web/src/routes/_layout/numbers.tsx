import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

import { Button } from "~/components/ui/button";
import { useLoggedInAuth, useSignout } from "~/lib/auth";
import {
  addNumberMutationOptions,
  deleteAllNumbersMutationOptions,
  getAllNumbersQueryOptions,
  updateNumberMutationOptions,
} from "~/queries/numbers";

export const Route = createFileRoute("/_layout/numbers")({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.loggedIn) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getAllNumbersQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const t = useTranslations("index");

  const auth = useLoggedInAuth();

  const numbers = useSuspenseQuery(getAllNumbersQueryOptions());

  const addNumber = useMutation(addNumberMutationOptions());
  const updateNumber = useMutation(updateNumberMutationOptions());
  const deleteNumbers = useMutation(deleteAllNumbersMutationOptions());
  const signout = useSignout();
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <p>
          {t("user")}: {auth.user.email}
        </p>
        <Button variant="outline" onClick={() => signout.mutate()}>
          {t("logout")}
        </Button>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => addNumber.mutate(Math.floor(Math.random() * 100))}>
          {t("add-number")}
        </Button>
        <Button variant="outline" onClick={() => deleteNumbers.mutate()}>
          {t("delete-all-numbers")}
        </Button>
      </div>
      <ul className="flex flex-col gap-3">
        {numbers.data.map((item) => (
          <li className="flex items-center justify-between gap-6" key={item.id}>
            <span className="text-xl font-bold">{item.number}</span>
            <Button
              variant="outline"
              onClick={() =>
                updateNumber.mutate({
                  id: item.id,
                  number: Math.floor(Math.random() * 100),
                })
              }
            >
              {t("update-number")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
