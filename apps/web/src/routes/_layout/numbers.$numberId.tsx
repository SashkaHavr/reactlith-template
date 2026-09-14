import { eq, queryOnce, useLiveSuspenseQuery } from "@tanstack/react-db";
import {
  createFileRoute,
  notFound,
  redirect,
  useHydrated,
  useNavigate,
} from "@tanstack/react-router";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import { getLocale } from "@reactlith-template/intl/runtime";
import { Button, LinkButton } from "~/components/ui/button";
import { useSession, useSignout } from "~/lib/auth";
import { numbersCollection, useDeleteNumber, useUpdateNumber } from "~/queries/numbers";

const NumberId = IdBranded("number");

export const Route = createFileRoute("/_layout/numbers/$numberId")({
  beforeLoad: ({ context: { session } }) => {
    if (!session.loggedIn) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context: { dbClient }, params }) => {
    const numberId = NumberId.make(params.numberId);
    const number = await queryOnce({
      query: (q) =>
        q
          .from({ numbers: dbClient.collection(numbersCollection) })
          .where(({ numbers }) => eq(numbers.id, numberId))
          .findOne(),
    });
    if (number === undefined) {
      throw notFound();
    }
    return { numberId };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { numberId } = Route.useLoaderData();
  const navigate = useNavigate();
  const session = useSession();
  const hydrated = useHydrated();
  const number = useLiveSuspenseQuery({
    query: (q) =>
      q
        .from({ numbers: numbersCollection })
        .where(({ numbers }) => eq(numbers.id, numberId))
        .findOne(),
  });
  const updateNumber = useUpdateNumber();
  const deleteNumber = useDeleteNumber();
  const signout = useSignout();
  const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
    dateStyle: "long",
    timeStyle: "medium",
  });

  if (number.data === undefined) {
    throw notFound();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <p>
          {m.example_user()}: {session.user.email}
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
            updateNumber({
              id: numberId,
              payload: { number: Math.floor(Math.random() * 100) },
            })
          }
        >
          <PencilIcon />
          {m.example_updateNumber()}
        </Button>
        <Button
          variant="destructive-outline"
          onClick={() => void navigate({ to: "/numbers" }).then(() => deleteNumber(numberId))}
        >
          <Trash2Icon />
          {m.example_deleteNumber()}
        </Button>
      </div>
      <div className="flex w-full flex-col items-center gap-6">
        <p className="text-4xl font-bold">{number.data.number}</p>
        <div className="grid grid-cols-[minmax(auto,_360px)] grid-rows-2 gap-2 text-left">
          <p>
            {m.example_createdAt()}:{" "}
            {hydrated && dateFormatter.format(new Date(number.data.createdAt))}
          </p>
          <p>
            {m.example_updatedAt()}:{" "}
            {hydrated && dateFormatter.format(new Date(number.data.updatedAt))}
          </p>
        </div>
      </div>
    </div>
  );
}
