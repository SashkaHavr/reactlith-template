import { Form } from "../ui/form";
import { useFormContext } from "./form-context";

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
