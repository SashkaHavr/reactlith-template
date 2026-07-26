import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { Button } from "./ui/button";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Form } from "./ui/form";
import { Input } from "./ui/input";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export function FormFieldError(props: Omit<React.ComponentProps<typeof FieldError>, "match">) {
  const field = useFieldContext();
  return (
    <FieldError match={!field.state.meta.isValid} {...props}>
      {field.state.meta.errors.map((_error, index) => {
        const error = _error as { message?: string } | string;
        return (
          <p key={`fielderror-${field.name}-${index}`}>
            {typeof error === "string" ? error : error.message}
          </p>
        );
      })}
    </FieldError>
  );
}
export function FormFieldLabel(
  props: Omit<React.ComponentProps<typeof FieldLabel>, "htmlFor" | "id" | "name">,
) {
  return <FieldLabel {...props} />;
}

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

export function FormSubmitButton({
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "type" | "disabled">) {
  const form = useFormContext();
  return (
    <form.Subscribe
      selector={(state) => ({ isSubmitting: state.isSubmitting, canSubmit: state.canSubmit })}
    >
      {(form) => {
        return (
          <Button type="submit" disabled={!form.canSubmit} loading={form.isSubmitting} {...props}>
            <span>{children}</span>
          </Button>
        );
      }}
    </form.Subscribe>
  );
}

export function FormForm(props: Omit<React.ComponentProps<typeof Form>, "id" | "onSubmit">) {
  const form = useFormContext();
  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      {...props}
    />
  );
}

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});
