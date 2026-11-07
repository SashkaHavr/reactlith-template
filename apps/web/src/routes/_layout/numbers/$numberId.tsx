import { useAtom, useAtomSet, useAtomSuspense } from "@effect/atom-react";
import { createFileRoute, notFound, useHydrated, useNavigate } from "@tanstack/react-router";
import { Cause, Effect, Exit } from "effect";
import { AsyncResult, AtomRegistry } from "effect/reactivity";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import { getLocale } from "@reactlith-template/intl/runtime";
import { Button, LinkButton } from "~/components/ui/button";
import { useSession, useSignout } from "~/lib/auth";
import { numberAtom, deleteNumberAtom, updateNumberAtom } from "~/queries/numbers";

const NumberId = IdBranded("number");

export const Route = createFileRoute("/_layout/numbers/$numberId")({
  loader: async ({ context: { registry }, params, abortController }) => {
    const numberId = NumberId.make(params.numberId);

    await Effect.runPromise(
      AtomRegistry.getResult(registry, numberAtom(numberId)).pipe(
        Effect.catchTag("NumberNotFound", () => Effect.fail(notFound())),
      ),
      { signal: abortController.signal },
    );
    return { numberId };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { numberId } = Route.useLoaderData();
  const navigate = useNavigate();
  const session = useSession();
  const hydrated = useHydrated();
  const numberResult = useAtomSuspense(numberAtom(numberId), { includeFailure: true });
  const updateNumber = useAtomSet(updateNumberAtom(numberId));
  const [deleteResult, deleteNumber] = useAtom(deleteNumberAtom(numberId), { mode: "promiseExit" });
  const signout = useSignout();
  const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
    dateStyle: "long",
    timeStyle: "medium",
  });

  const handleDelete = async () => {
    const result = await deleteNumber();
    if (Exit.isSuccess(result)) {
      await navigate({ to: "/numbers" });
    }
  };

  if (AsyncResult.isFailure(numberResult)) {
    if (deleteResult.waiting || AsyncResult.isSuccess(deleteResult)) return null;
    throw Cause.squash(numberResult.cause);
  }
  const number = numberResult.value;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <p>
          {m.example_user()}: {session.user.email}
        </p>
        <Button variant="outline" onClick={() => void signout()}>
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
          onClick={() => updateNumber({ number: Math.floor(Math.random() * 100) })}
        >
          <PencilIcon />
          {m.example_updateNumber()}
        </Button>
        <Button variant="destructive-outline" onClick={() => void handleDelete()}>
          <Trash2Icon />
          {m.example_deleteNumber()}
        </Button>
      </div>
      <div className="flex w-full flex-col items-center gap-6">
        <p className="text-4xl font-bold">{number.number}</p>
        <div className="grid grid-cols-[minmax(auto,_360px)] grid-rows-2 gap-2 text-left">
          <p>
            {m.example_createdAt()}: {hydrated && dateFormatter.format(new Date(number.createdAt))}
          </p>
          <p>
            {m.example_updatedAt()}: {hydrated && dateFormatter.format(new Date(number.updatedAt))}
          </p>
        </div>
      </div>
    </div>
  );
}
