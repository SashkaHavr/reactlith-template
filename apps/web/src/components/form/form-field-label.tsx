import { FieldLabel } from "../ui/field";

export function FormFieldLabel(
  props: Omit<React.ComponentProps<typeof FieldLabel>, "htmlFor" | "id" | "name">,
) {
  return <FieldLabel {...props} />;
}
