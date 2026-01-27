import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { useFormContext } from "./form-context";

export function FormSubmitButton({
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "type" | "disabled">) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
      {([canSubmit, isSubmitting]) => {
        return (
          <Button type="submit" disabled={!canSubmit} {...props}>
            {isSubmitting && <Spinner />}
            <span>{children}</span>
          </Button>
        );
      }}
    </form.Subscribe>
  );
}
