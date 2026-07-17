import { useAtomSuspense } from "@effect/atom-react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

import { Button } from "~/components/ui/button";
import { preloadAtom } from "~/lib/atom";
import { useLoggedInAuth, useSignout } from "~/lib/auth";
import { numbersAtom, useAddNumber, useDeleteAllNumbers, useUpdateNumber } from "~/queries/numbers";

export const Route = createFileRoute("/_layout/numbers")({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.loggedIn) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context: { atomRegistry } }) => {
    await preloadAtom(atomRegistry, numbersAtom);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const t = useTranslations("index");

  const auth = useLoggedInAuth();

  const numbers = useAtomSuspense(numbersAtom);

  const addNumber = useAddNumber();
  const updateNumber = useUpdateNumber();
  const deleteNumbers = useDeleteAllNumbers();
  const signout = useSignout();
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <p>
          {t("user")}: {auth.user.email}
        </p>
        <Button variant="outline" onClick={() => void signout()}>
          {t("logout")}
        </Button>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => addNumber(Math.floor(Math.random() * 100))}>
          {t("add-number")}
        </Button>
        <Button variant="outline" onClick={() => deleteNumbers()}>
          {t("delete-all-numbers")}
        </Button>
      </div>
      <ul className="flex flex-col gap-3">
        {numbers.value.map((item) => (
          <li className="flex items-center justify-between gap-6" key={item.id}>
            <span className="text-xl font-bold">{item.number}</span>
            <Button
              variant="outline"
              onClick={() =>
                updateNumber({
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
