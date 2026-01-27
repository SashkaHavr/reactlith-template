# AGENTS.md

This repository is a Bun-based TypeScript monorepo.

## Root commands

- Install packages: `bun install`.
- Check everything: `bun run check`.
- Check code style and type errors: `bun run lint`.
- Fix format issues: `bun run format`.
- Never run any other commands unless explicitly requested.

## Repository layout

- `apps/*`: TanStack React Start app (SSR + router + query + tailwind).
- `packages/*`: auth, db, env, intl, trpc, utils, empty, typescript-config.

## Code style conventions

### General

- Do not access `process.env` directly outside the env package. Define env vars in `packages/env/src/*`.
- Do not edit directly: `**/*.gen.ts`, `**/generated/**`, `**/drizzle/**`, `**/dist/**`, `packages/db/src/schema/auth.ts`

### React / Tanstack Start

- Use `cn(...)` for className composition in React components.
- Use base components from `src/components/ui/*` whenever possible.
- Base components are created with base-ui primitives and don't have `asChild` prop. Use `render` prop instead.
  Example: `<Button className="..." render={<Link to="..."/>}>Click me!</Button>`.
- Put route specific components in `src/routes/someRoute/-components/*` and reusable components in `src/components/*`.
- Keep route components thin. Place only route-specific providers and general layout in route components.
- Use `useTrpc()` and `useSuspenseQuery(trpc.someQuery.queryOptions())` for stable tRPC queries in React components.
- Use `useTrpc()` and `useQuery(trpc.someQuery.queryOptions())` for conditional tRPC queries in React components.
  Preload them manually with `context.queryClient.ensureQueryData(context.trpc.someQuery.queryOptions())` in route `loader`.
- Use form components and hooks from `src/components/form/*` for forms.
  Example:
  ```tsx
  const form = useAppForm({
    defaultValues: { someField: "" },
    validators: { onSubmit: z.object({ someField: ...}) },
    onSubmit: (data) => { ... },
  });
  <form.AppForm>
    <Form>
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
    </Form>
  </form.AppForm>
  ```

### tRPC

- Use `zod` schemas for runtime validation of inputs/outputs.
- Always explicitly specify output for tRPC procedures. Use `z.undefined()` if no output.
- Use appropriate procedure from `src/procedures/*`. Create new reusable procedure if necessary.
- Use `TRPCError` with explicit `code` and `message` for error handling.
- Use `db` through `context` (`ctx.db`). DB schema lives in `packages/db/src/schema/*`.

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
