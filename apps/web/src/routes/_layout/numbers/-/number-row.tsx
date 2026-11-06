import { useAtomSet } from "@effect/atom-react";
import { ArrowRightIcon, PencilIcon, Trash2Icon } from "lucide-react";

import type { NumberOutput } from "@reactlith-template/api-contract/features/numbers";
import { Button, LinkButton } from "~/components/ui/button";
import { deleteNumberAtom, updateNumberAtom } from "~/queries/numbers";

export function NumberRow({ number }: { number: typeof NumberOutput.Type }) {
  const updateNumber = useAtomSet(updateNumberAtom(number.id));
  const deleteNumber = useAtomSet(deleteNumberAtom(number.id));

  return (
    <div className="flex items-center gap-2">
      <p className="min-w-8 flex-1 text-xl font-bold">{number.number}</p>
      <Button
        size="icon"
        variant="outline"
        onClick={() => updateNumber({ number: Math.floor(Math.random() * 100) })}
      >
        <PencilIcon />
      </Button>
      <Button size="icon" variant="destructive-outline" onClick={() => deleteNumber()}>
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
  );
}
