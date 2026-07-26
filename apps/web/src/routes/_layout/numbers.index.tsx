import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowRightIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import z from "zod";

import { m } from "@reactlith-template/intl/messages";
import { numberInput } from "@reactlith-template/trpc/schema/numbers";
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
const customNumberInput = numberInput.extend({
  number: z.string().min(1).transform(Number).pipe(numberInput.shape.number),
});

function RouteComponent() {
  const [customNumberDialogOpen, setCustomNumberDialogOpen] = useState(false);
  const trpc = useTRPC();
  const auth = useLoggedInAuth();
  const numbers = useSuspenseQuery(trpc.numbers.getAll.queryOptions());
  const addNumber = useAddNumber();
  const updateNumber = useUpdateNumber();
  const deleteNumber = useDeleteNumber();
  const deleteNumbers = useDeleteAllNumbers();
  const signout = useSignout();
  const customNumberForm = useAppForm({
    defaultValues: { number: "" },
    validators: { onSubmit: customNumberInput },
    onSubmit: async ({ value, formApi }) => {
      await addNumber.mutateAsync(customNumberInput.parse(value));
      setCustomNumberDialogOpen(false);
      formApi.reset();
    },
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
        <Button variant="outline" onClick={() => addNumber.mutate({ number: generateNumber() })}>
          {m.example_addNumber()}
        </Button>
        <Dialog open={customNumberDialogOpen} onOpenChange={setCustomNumberDialogOpen}>
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
