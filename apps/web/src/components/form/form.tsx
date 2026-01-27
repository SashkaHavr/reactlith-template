import { useFormContext } from "./form-context";

export function Form(props: Omit<React.ComponentProps<"form">, "id" | "onSubmit">) {
  const form = useFormContext();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      {...props}
    />
  );
}
