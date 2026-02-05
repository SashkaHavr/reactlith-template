# AGENTS.md

Bun-based TypeScript monorepo with a TanStack React Start app and shared packages.

## Quick Reference

- Package manager: Bun
- Check (type + lint): `bun check:llm`
- NEVER run other commands unless explicitly requested.

## Repository layout

- `apps/*`: TanStack React Start app (SSR + router + query + tailwind).
- `packages/*`: auth, db, env, intl, trpc, utils, empty, typescript-config.

## General code style

- Do not access `process.env` directly outside the env package. Define env vars in `packages/env/src/*`.
- Do not edit directly: `**/*.gen.ts`, `**/generated/**`, `**/drizzle/**`, `**/dist/**`, `packages/db/src/schema/auth.ts`.
- Prefer named top-level `function` declarations over top-level arrow functions.

## Rules for TanStack React Start app

### Components and styling

- Use `~/lib/utils` `cn(...)` for className composition in React components.
- Use base components from `src/components/ui/*` whenever possible.
- Base components are created with base-ui primitives and do not have `asChild`. Use the `render` prop instead.
  Example: `<Button className="..." render={<Link to="..." />}>Click me!</Button>`.
- When rendering links inside buttons, pass `nativeButton={false}` and use `render={<Link ... />}`.
- Use form components and hooks from `src/components/form/*` for forms.

#### Example form usage:

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

### Routes and structure

- Keep route components thin: route files should wire routing (`createFileRoute`), route data loading (`loader`/`beforeLoad`), and the top-level layout/structure only.
- Put route-specific UI, dialogs, and feature components in `src/routes/<route>/-components/*` and import them into the route file.
- Put shared/reusable components in `src/components/*` so they can be used across routes.
- When creating sub-routes, always create a folder `someRoute/` and use `someRoute/index.tsx` for the index route and `someRoute/route.tsx` for layout.

### tRPC queries in React

- Use `useTRPC()` and `useSuspenseQuery(trpc.someQuery.queryOptions())` for non-conditional tRPC queries in React components.
- Use `useTRPC()` and `useQuery(trpc.someQuery.queryOptions())` for conditional tRPC queries in React components.
  Preload conditional queries manually with `context.queryClient.ensureQueryData(context.trpc.someQuery.queryOptions())` in route `loader`.

## Rules for tRPC procedures

### Procedures and schemas

- Use `zod` schemas for runtime validation of inputs/outputs.
- Always explicitly specify output for tRPC procedures. Use `z.undefined()` if no output.
- Use appropriate procedure from `src/procedures/*`. Create a new reusable procedure if necessary.

### Errors and data access

- Use `TRPCError` with explicit `code` and `message` for error handling.
- Use `db` through `context` (`ctx.db`). DB schema lives in `packages/db/src/schema/*`.
