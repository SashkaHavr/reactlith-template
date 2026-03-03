# AGENTS.md

## Monorepo

- Always use `bun` as package manager and task runner.
- Always run `bun fix` after making any changes.
- Never run `bun dev` or `bun build` in any package unless explicitly requested.

## General code style

- Do not access `process.env` directly outside the env package. Define env vars in `packages/env/src/*`.
- Prefer named top-level `function` declarations over top-level arrow functions.

## Client-side React code

- Use `~/lib/utils` `cn(...)` for className composition in React components.
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

- Keep route components thin: route files should wire routing (`createFileRoute`), route data loading (`loader`/`beforeLoad`), and the top-level layout/structure only.
- Put route-specific UI, dialogs, and feature components in `src/routes/<route>/-components/*` and import them into the route file.
- Put shared/reusable components in `src/components/*` so they can be used across routes.
- When creating sub-routes, always create a folder `src/routes/<route>/` and use `src/routes/<route>/index.tsx` for the index route and `src/routes/<route>/route.tsx` for layout.
- Use `useTRPC()` and `useSuspenseQuery(trpc.someQuery.queryOptions())` for non-conditional tRPC queries in React components. These queries will be automatically preloaded.
- Use `useTRPC()` and `useQuery(trpc.someQuery.queryOptions())` for conditional tRPC queries in React components. Preload conditional queries manually with `context.queryClient.ensureQueryData(context.trpc.someQuery.queryOptions())` in route `loader`.

## Backend tRPC procedures

- Always explicitly specify output for tRPC procedures. Use `z.undefined()` if no output.
- Use appropriate procedure from `src/procedures/*`. Create a new reusable procedure if necessary.
- Use `TRPCError` with explicit `code` and `message` for error handling.
- Use `db` through `context` (`ctx.db`).
