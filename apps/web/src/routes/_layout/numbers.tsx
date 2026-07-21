import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";

import type { IdBranded } from "@reactlith-template/db/utils";
import { m } from "@reactlith-template/intl/messages";
import { Button } from "~/components/ui/button";
import { useLoggedInAuth, useSignout } from "~/lib/auth";
import { api } from "~/lib/query";
import {
  addNumberMutationOptions,
  deleteAllNumbersMutationOptions,
  deleteNumberMutationOptions,
  updateNumberMutationOptions,
} from "~/queries/numbers";

export const Route = createFileRoute("/_layout/numbers")({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.loggedIn) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(api.numbers.getAll.queryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  // const t = useTranslations("index");

  const auth = useLoggedInAuth();

  const numbers = useSuspenseQuery(api.numbers.getAll.queryOptions());

  const addNumber = useMutation(addNumberMutationOptions());
  const updateNumber = useMutation(updateNumberMutationOptions());
  const deleteNumber = useMutation(deleteNumberMutationOptions());
  const deleteNumbers = useMutation(deleteAllNumbersMutationOptions());
  const signout = useSignout();
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <p>
          {m.user()}: {auth.user.email}
        </p>
        <Button variant="outline" onClick={() => signout.mutate()}>
          {m.logout()}
        </Button>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => addNumber.mutate({ payload: { number: Math.floor(Math.random() * 100) } })}
        >
          {m.add_number()}
        </Button>
        <Button variant="outline" onClick={() => deleteNumbers.mutate()}>
          {m.delete_all_numbers()}
        </Button>
      </div>
      <ul className="flex flex-col gap-3">
        {numbers.data.map((item) => (
          <li className="flex items-center justify-between gap-6" key={item.id}>
            <NumberValues id={item.id} listValue={item.number} />
            <div className="flex items-center gap-2">
              <Button
                aria-label={m.update_number()}
                size="icon"
                title={m.update_number()}
                variant="outline"
                onClick={() =>
                  updateNumber.mutate({
                    params: { id: item.id },
                    payload: { number: Math.floor(Math.random() * 100) },
                  })
                }
              >
                <Pencil />
              </Button>
              <Button
                aria-label="Delete number"
                onClick={() => deleteNumber.mutate({ params: { id: item.id } })}
                size="icon"
                title="Delete number"
                variant="destructive-outline"
              >
                <Trash2 />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NumberValues({ id, listValue }: { id: IdBranded<"number">; listValue: number }) {
  const number = useSuspenseQuery(api.numbers.get.queryOptions({ params: { id } }));

  return (
    <span className="flex items-baseline gap-2 text-xl font-bold">
      <span>{listValue}</span>
      <span className="text-sm font-normal text-muted-foreground">GET: {number.data.number}</span>
    </span>
  );
}
