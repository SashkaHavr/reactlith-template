import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  notFound,
  redirect,
  useHydrated,
  useNavigate,
} from "@tanstack/react-router";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";

import type { ApiErrors } from "@reactlith-template/api";
import { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import { getLocale } from "@reactlith-template/intl/runtime";
import { Button, LinkButton } from "~/components/ui/button";
import { useSession, useSignout } from "~/lib/auth";
import { getNumberQueryOptions, useDeleteNumber, useUpdateNumber } from "~/queries/numbers";

const NumberId = IdBranded("number");

export const Route = createFileRoute("/_layout/numbers/$numberId")({
  beforeLoad: ({ context: { session } }) => {
    if (!session.loggedIn) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context: { queryClient }, params }) => {
    const numberId = NumberId.make(params.numberId);

    try {
      await queryClient.query({ ...getNumberQueryOptions({ id: numberId }), staleTime: "static" });
    } catch (err) {
      const error = err as ApiErrors["numbers"]["get"];
      if (error._tag === "NumberNotFound") {
        throw notFound();
      }
      throw error;
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
  const number = useSuspenseQuery(getNumberQueryOptions({ id: numberId }));
  const updateNumber = useUpdateNumber();
  const deleteNumber = useDeleteNumber();
  const signout = useSignout();
  const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
    dateStyle: "long",
    timeStyle: "medium",
  });

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
            updateNumber.mutate({
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
          onClick={() =>
            void navigate({ to: "/numbers" }).then(() => deleteNumber.mutate({ id: numberId }))
          }
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
