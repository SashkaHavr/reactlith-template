---
name: react
description: Use when creating or updating React components, creating forms or routes, or using TanStack Router, Start, Query, or Form
---

## Client-side React code

- Use `cn(...)` from `~/lib/utils` to compose class names in React components. Use it only for conditional class names, not to split long strings.
- Always check `src/components/ui/*` for an applicable component before creating one.
- Base components are created with Base UI primitives and do not have an `asChild` prop. Use the `render` prop instead. Example: `<DialogTrigger render={<Button />}>Click me!</Button>`.
- Use the components and hooks from `src/components/form.tsx` when building forms.
  Example:

```tsx
const form = useAppForm({
  defaultValues: { ... },
  validators: { onSubmit: schema },
  onSubmit: (data) => { ... },
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

- Always reuse schemas from the backend for form validation.
- Put route-specific UI, dialogs, components, and utilities in `src/routes/<route>/-/*`.
- Put reusable components shared across routes in `src/components/*`.
- The project includes the React Compiler, so you don't need to use `useMemo` or `useCallback`.
- Use messages from `@reactlith-template/intl/messages` for all user-facing text. Add or update every locale in `packages/intl/messages/*.json`; never edit the generated files in `packages/intl/src`.
- When creating subroutes, always create a `src/routes/<route>/` folder. Use `src/routes/<route>/index.tsx` for the index route and `src/routes/<route>/route.tsx` for the layout.
- Perform access checks and redirects in a route's `beforeLoad`, not in component effects.
- Use TanStack Router's `Link`, `useNavigate`, or the shared `LinkButton` for internal navigation instead of raw anchors or `window.location`.
- Preload queries with `await context.queryClient.ensureQueryData(context.trpc.someQuery.queryOptions())` in the route's `loader`.
- Use `useTRPC()` and `useSuspenseQuery(trpc.someQuery.queryOptions())` for unconditional tRPC queries in React components.
- Use `useTRPC()` and `useQuery(trpc.someQuery.queryOptions())` for conditional tRPC queries in React components.
- Use the second parameter of `.queryOptions()` to specify options such as `enabled` or `select` when needed, for example, `trpc.someQuery.queryOptions(input, { enabled: false })`.
- Put all mutations and non-obvious queries in `/src/queries`.
- Use `matchError(error, <ErrorClass>)` to match domain errors from the backend.
