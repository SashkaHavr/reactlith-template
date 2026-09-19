import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import { ArrowRightIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { NumberInput } from "@reactlith-template/api/schema/numbers";
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
import { Button, LinkButton } from "~/components/ui/button";
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
import {
  allNumbersQueryOptions,
  useAddNumber,
  useDeleteAllNumbers,
  useDeleteNumber,
  useUpdateNumber,
} from "~/queries/numbers";

export const Route = createFileRoute("/_layout/numbers/")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.query({ ...allNumbersQueryOptions, staleTime: "static" });
  },
  component: RouteComponent,
});

const CustomNumberFormSchema = Schema.toStandardSchemaV1(
  Schema.Struct({
    ...NumberInput.fields,
    number: Schema.FiniteFromString.pipe(Schema.decodeTo(NumberInput.fields.number)),
  }),
);

function RouteComponent() {
  const [customNumberDialogOpen, setCustomNumberDialogOpen] = useState(false);
  const session = useSession();
  const numbers = useSuspenseQuery(allNumbersQueryOptions);
  const addNumber = useAddNumber();
  const updateNumber = useUpdateNumber();
  const deleteNumber = useDeleteNumber();
  const deleteNumbers = useDeleteAllNumbers();
  const signout = useSignout();
  const customNumberForm = useAppForm({
    defaultValues: { number: "" },
    validators: { onSubmit: CustomNumberFormSchema },
    onSubmit: async ({ value, formApi }) => {
      await addNumber.mutateAsync(Schema.decodeSync(CustomNumberFormSchema)(value));
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
        <Button variant="outline" onClick={() => signout.mutate()}>
          {m.example_logout()}
        </Button>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => addNumber.mutate({ number: Math.floor(Math.random() * 100) })}
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
                  <FormSubmitButton>{m.example_submit()}</FormSubmitButton>
                </DialogFooter>
              </FormForm>
            </customNumberForm.AppForm>
          </DialogPopup>
        </Dialog>
        <Button variant="outline" onClick={() => deleteNumbers.mutate()}>
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
        {numbers.data.numbers.map((number) => (
          <div key={number.id} className="flex items-center gap-2">
            <p className="min-w-8 flex-1 text-xl font-bold">{number.number}</p>
            <Button
              size="icon"
              variant="outline"
              onClick={() =>
                updateNumber.mutate({
                  id: number.id,
                  payload: { number: Math.floor(Math.random() * 100) },
                })
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
