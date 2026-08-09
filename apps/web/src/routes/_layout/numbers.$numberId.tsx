import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  notFound,
  redirect,
  useHydrated,
  useNavigate,
} from "@tanstack/react-router";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";

import type { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import { getLocale } from "@reactlith-template/intl/runtime";
import { NumberNotFound } from "@reactlith-template/trpc/errors/numbers";
import { Button, LinkButton } from "~/components/ui/button";
import { useLoggedInAuth, useSignout } from "~/lib/auth";
import { matchError, useTRPC } from "~/lib/trpc";
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
      if (matchError(e, NumberNotFound)) {
        throw notFound();
      }
    }
    return { numberId };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { numberId } = Route.useLoaderData();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const auth = useLoggedInAuth();
  const hydrated = useHydrated();
  const number = useSuspenseQuery(trpc.numbers.getById.queryOptions({ id: numberId }));
  const updateNumber = useUpdateNumber();
  const deleteNumber = useDeleteNumber({
    onSuccess: async () => await navigate({ to: "/numbers" }),
  });
  const signout = useSignout();
  const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
    dateStyle: "long",
    timeStyle: "medium",
  });

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
          {m.example_backToNumbers()}
        </LinkButton>
        <Button
          variant="outline"
          onClick={() =>
            updateNumber.mutate({ id: numberId, data: { number: Math.floor(Math.random() * 100) } })
          }
        >
          <PencilIcon />
          {m.example_updateNumber()}
        </Button>
        <Button variant="destructive-outline" onClick={() => deleteNumber.mutate({ id: numberId })}>
          <Trash2Icon />
          Delete number
        </Button>
      </div>
      <div className="flex w-full max-w-md flex-col gap-6">
        <p className="text-center text-4xl font-bold">{number.data.number}</p>
        <div className="flex flex-col gap-2 text-left">
          <p>
            {m.example_createdAt()}: {hydrated && dateFormatter.format(number.data.createdAt)}
          </p>
          <p>
            {m.example_updatedAt()}: {hydrated && dateFormatter.format(number.data.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
