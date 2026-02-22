import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { useFormContext } from "./form-context";

export function FormSubmitButton({
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "type" | "disabled">) {
  const form = useFormContext();
  return (
    <form.Subscribe
      // @ts-expect-error type error in tsgo?
      selector={(state) => ({ isSubmitting: state.isSubmitting, canSubmit: state.canSubmit })}
    >
      {(form) => {
        return (
          <Button type="submit" disabled={!form.canSubmit} {...props}>
            {form.isSubmitting && <Spinner />}
            <span>{children}</span>
          </Button>
        );
      }}
    </form.Subscribe>
  );
}
