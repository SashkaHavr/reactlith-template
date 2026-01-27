import { Input } from "../ui/input";
import { useFieldContext } from "./form-context";

export function FormInput(
  props: Omit<
    React.ComponentProps<typeof Input>,
    "value" | "onValueChange" | "onBlur" | "name" | "id"
  >,
) {
  const field = useFieldContext<string>();
  return (
    <Input
      value={field.state.value}
      onValueChange={field.handleChange}
      onBlur={field.handleBlur}
      {...props}
    />
  );
}
