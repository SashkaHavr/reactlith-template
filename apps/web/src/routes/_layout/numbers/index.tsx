import { useAtomSet, useAtomSuspense } from "@effect/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import { Effect, Schema } from "effect";
import { AtomRegistry } from "effect/reactivity";
import { useState } from "react";

import { NumberValue } from "@reactlith-template/api-contract/features/numbers";
import { m } from "@reactlith-template/intl/messages";
import {
  FormField,
  FormFieldError,
  FormFieldLabel,
  FormForm,
  FormInput,
  FormSubmitButton,
  useAppForm,
} from "~/components/form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useSession, useSignout } from "~/lib/auth";
import { allNumbersAtom, addNumberAtom, deleteAllNumbersAtom } from "~/queries/numbers";

import { NumberRow } from "./-/number-row";

export const Route = createFileRoute("/_layout/numbers/")({
  loader: async ({ context: { registry }, abortController }) => {
    await Effect.runPromise(AtomRegistry.getResult(registry, allNumbersAtom), {
      signal: abortController.signal,
    });
  },
  component: RouteComponent,
});

const CustomNumberFormSchema = Schema.toStandardSchemaV1(
  Schema.Struct({
    number: Schema.Trim.check(Schema.isNonEmpty()).pipe(
      Schema.decodeTo(Schema.FiniteFromString),
      Schema.decodeTo(NumberValue),
    ),
  }),
);

function RouteComponent() {
  const [customNumberDialogOpen, setCustomNumberDialogOpen] = useState(false);
  const session = useSession();
  const numbers = useAtomSuspense(allNumbersAtom).value;
  const addNumber = useAtomSet(addNumberAtom);
  const addNumberAsync = useAtomSet(addNumberAtom, { mode: "promise" });
  const deleteAllNumbers = useAtomSet(deleteAllNumbersAtom);
  const signout = useSignout();
  const customNumberForm = useAppForm({
    defaultValues: { number: "" },
    validators: { onSubmit: CustomNumberFormSchema },
    onSubmit: async ({ value, formApi }) => {
      await addNumberAsync(Schema.decodeSync(CustomNumberFormSchema)(value));
      setCustomNumberDialogOpen(false);
      formApi.reset();
    },
  });

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
        <Button
          variant="outline"
          onClick={() => addNumber({ number: Math.floor(Math.random() * 100) })}
        >
          {m.example_addNumber()}
        </Button>
        <Dialog
          open={customNumberDialogOpen}
          onOpenChange={(open) => {
            if (open) {
              customNumberForm.reset();
            }
            setCustomNumberDialogOpen(open);
          }}
        >
          <DialogTrigger render={<Button variant="outline" />}>
            {m.example_addCustomNumber()}
          </DialogTrigger>
          <DialogPopup>
            <DialogHeader>
              <DialogTitle>{m.example_addCustomNumber()}</DialogTitle>
            </DialogHeader>
            <customNumberForm.AppForm>
              <FormForm className="contents">
                <DialogPanel className="grid gap-4">
                  <customNumberForm.AppField name="number">
                    {() => (
                      <FormField>
                        <FormFieldLabel>{m.example_number()}</FormFieldLabel>
                        <FormInput />
                        <FormFieldError />
                      </FormField>
                    )}
                  </customNumberForm.AppField>
                </DialogPanel>
                <DialogFooter>
                  <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
                  <fieldset className="contents">
                    <FormSubmitButton>{m.example_submit()}</FormSubmitButton>
                  </fieldset>
                </DialogFooter>
              </FormForm>
            </customNumberForm.AppForm>
          </DialogPopup>
        </Dialog>
        <Button variant="outline" onClick={() => deleteAllNumbers()}>
          {m.example_deleteAllNumbers()}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            throw new Error("Intentional test error");
          }}
        >
          {m.example_throwError()}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {numbers.numbers.map((number) => (
          <NumberRow key={number.id} number={number} />
        ))}
      </div>
    </div>
  );
}
