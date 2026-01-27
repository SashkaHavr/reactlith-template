import { FieldError } from "../ui/field";
import { useFieldContext } from "./form-context";

export function FormFieldError(props: Omit<React.ComponentProps<typeof FieldError>, "match">) {
  const field = useFieldContext();
  return (
    <FieldError match={!field.state.meta.isValid} {...props}>
      {field.state.meta.errors.map((_error, index) => {
        const error = _error as { message?: string } | string;
        return (
          <p key={`error-${field.name}-${index}`}>
            {typeof error === "string" ? error : error.message}
          </p>
        );
      })}
    </FieldError>
  );
}
