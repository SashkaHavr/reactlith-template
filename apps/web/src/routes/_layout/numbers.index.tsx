import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowRightIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { m } from "@reactlith-template/intl/messages";
import { Button, LinkButton } from "~/components/ui/button";
import { useLoggedInAuth, useSignout } from "~/lib/auth";
import { useTRPC } from "~/lib/trpc";
import {
  useAddNumber,
  useDeleteAllNumbers,
  useDeleteNumber,
  useUpdateNumber,
} from "~/queries/numbers";

export const Route = createFileRoute("/_layout/numbers/")({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.loggedIn) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context: { queryClient, trpc } }) => {
    await queryClient.ensureQueryData(trpc.numbers.getAll.queryOptions());
  },
  component: RouteComponent,
});

const generateNumber = () => Math.floor(Math.random() * 100);

function RouteComponent() {
  const trpc = useTRPC();
  const auth = useLoggedInAuth();
  const numbers = useSuspenseQuery(trpc.numbers.getAll.queryOptions());
  const addNumber = useAddNumber();
  const updateNumber = useUpdateNumber();
  const deleteNumber = useDeleteNumber();
  const deleteNumbers = useDeleteAllNumbers();
  const signout = useSignout();

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <p>
          {m.example_user()}: {auth.user.email}
        </p>
        <Button variant="outline" onClick={() => signout.mutate()}>
          {m.example_logout()}
        </Button>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={() => addNumber.mutate({ number: generateNumber() })}>
          {m.example_addNumber()}
        </Button>
        <Button variant="outline" onClick={() => deleteNumbers.mutate()}>
          {m.example_deleteAllNumbers()}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {numbers.data.numbers.map((number) => (
          <div key={number.id} className="flex items-center gap-2">
            <p className="min-w-8 flex-1 text-xl font-bold">{number.number}</p>
            <Button
              size="icon"
              variant="outline"
              onClick={() =>
                updateNumber.mutate({ id: number.id, data: { number: generateNumber() } })
              }
            >
              <PencilIcon />
            </Button>
            <Button
              size="icon"
              variant="destructive-outline"
              onClick={() => deleteNumber.mutate({ id: number.id })}
            >
              <Trash2Icon />
            </Button>
            <LinkButton
              params={{ numberId: number.id }}
              size="icon"
              to="/numbers/$numberId"
              variant="outline"
            >
              <ArrowRightIcon />
            </LinkButton>
          </div>
        ))}
      </div>
    </div>
  );
}
