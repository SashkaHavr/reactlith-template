import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";

import type { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import { Button, LinkButton } from "~/components/ui/button";
import { useLoggedInAuth, useSignout } from "~/lib/auth";
import { parseTRPCError, useTRPC } from "~/lib/trpc";
import { useDeleteNumber, useUpdateNumber } from "~/queries/numbers";

export const Route = createFileRoute("/_layout/numbers/$numberId")({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.loggedIn) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context: { queryClient, trpc }, params }) => {
    const numberId = params.numberId as IdBranded<"number">;
    try {
      await queryClient.ensureQueryData(trpc.numbers.getById.queryOptions({ id: numberId }));
    } catch (e) {
      if (parseTRPCError(e).code === "numbers.NOT_FOUND") {
        throw notFound();
      }
    }
    return { numberId };
  },
  component: RouteComponent,
});

const generateNumber = () => Math.floor(Math.random() * 100);

function RouteComponent() {
  const { numberId } = Route.useLoaderData();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const auth = useLoggedInAuth();
  const number = useSuspenseQuery(trpc.numbers.getById.queryOptions({ id: numberId }));
  const updateNumber = useUpdateNumber();
  const deleteNumber = useDeleteNumber({
    onSuccess: async () => await navigate({ to: "/numbers" }),
  });
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
        <LinkButton to="/numbers" variant="outline">
          <ArrowLeftIcon />
          Back to numbers
        </LinkButton>
        <Button
          variant="outline"
          onClick={() => updateNumber.mutate({ id: numberId, data: { number: generateNumber() } })}
        >
          <PencilIcon />
          {m.example_updateNumber()}
        </Button>
        <Button variant="destructive-outline" onClick={() => deleteNumber.mutate({ id: numberId })}>
          <Trash2Icon />
          Delete number
        </Button>
      </div>
      <div className="w-full max-w-md text-center">
        <p className="text-4xl font-bold">{number.data.number}</p>
      </div>
    </div>
  );
}
