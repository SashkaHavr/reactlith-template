import { Field } from "../ui/field";
import { useFieldContext } from "./form-context";

export function FormField(
  props: Omit<React.ComponentProps<typeof Field>, "name" | "invalid" | "dirty" | "touched">,
) {
  const field = useFieldContext();
  return (
    <Field
      name={field.name}
      invalid={!field.state.meta.isValid}
      dirty={field.state.meta.isDirty}
      touched={field.state.meta.isTouched}
      {...props}
    />
  );
}
