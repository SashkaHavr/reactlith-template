import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { m } from "@reactlith-template/intl/messages";
import { Button } from "~/components/ui/button";
import { useLoggedInAuth, useSignout } from "~/lib/auth";
import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/_layout/numbers")({
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

function RouteComponent() {
  const trpc = useTRPC();

  const auth = useLoggedInAuth();

  const numbers = useSuspenseQuery(trpc.numbers.getAll.queryOptions());

  const addNumber = useMutation(trpc.numbers.addNew.mutationOptions());
  const deleteNumbers = useMutation(trpc.numbers.deleteAll.mutationOptions());
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
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => addNumber.mutate()}>
          {m.example_addNumber()}
        </Button>
        <Button variant="outline" onClick={() => deleteNumbers.mutate()}>
          {m.example_deleteAllNumbers()}
        </Button>
      </div>
      <p className="text-xl font-bold">{JSON.stringify(numbers.data.numbers)}</p>
    </div>
  );
}
