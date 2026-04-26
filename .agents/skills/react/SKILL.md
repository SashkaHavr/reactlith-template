---
name: react
description: Use when creating or updating react components, creating forms, creating new routes, using tanstack router/start/query/form
---

## Client-side React code

- Use `~/lib/utils` `cn(...)` for className composition in React components. Don't use it just to split long className strings, only when conditional classNames are needed.
- Use components from `src/components/ui/*` instead of standard html elements (e.g. `Button`, `Input`).
- Base components are created with base-ui primitives and do not have `asChild`. Use the `render` prop instead. Example: `<DialogTrigger render={<Button />}>Click me!</Button>`.
- Use form components and hooks from `src/components/form/*` for forms.
  Example:

```tsx
const form = useAppForm({
  defaultValues: { someField: "" },
  validators: { onSubmit: z.object({ someField: ... }) },
  onSubmit: (data) => {
    // ...
  },
});

<form.AppForm>
  <FormForm>
    <form.AppField name="someField">
      {() => (
        <FormField>
          <FormFieldLabel>Some Field</FormFieldLabel>
          <FormInput />
          <FormFieldError />
        </FormField>
      )}
    </form.AppField>
    <FormSubmitButton>Submit</FormSubmitButton>
  </FormForm>
</form.AppForm>;
```

- Put route-specific UI, dialogs, and feature components in `src/routes/<route>/-components/*` and import them into the route file.
- Put shared/reusable components in `src/components/*` so they can be used across routes.
- When creating sub-routes, always create a folder `src/routes/<route>/` and use `src/routes/<route>/index.tsx` for the index route and `src/routes/<route>/route.tsx` for layout.
- Use `useTRPC()` and `useSuspenseQuery(trpc.someQuery.queryOptions())` for non-conditional tRPC queries in React components. These queries will be automatically preloaded.
- Use `useTRPC()` and `useQuery(trpc.someQuery.queryOptions())` for conditional tRPC queries in React components. Preload conditional queries manually with `context.queryClient.ensureQueryData(context.trpc.someQuery.queryOptions())` in route `loader`.
- Use second paramter of `.queryOptions()` to specify query options like `enabled` or `select` when needed, e.g. `trpc.someQuery.queryOptions(input, { enabled: false })`.
