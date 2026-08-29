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
- Put all API query options and mutation hooks in `/src/queries`.
- Define API queries with TanStack Query's `queryOptions`. Use a stable query key, get the Effect HTTP API client with `getApi()`, and call the endpoint in `queryFn`.
- Always pass the `queryFn` abort signal to `Effect.runPromise`: `queryFn: async ({ signal }) => Effect.runPromise((await getApi()).<group>.<endpoint>(input), { signal })`.
- Preload queries in route loaders with `await context.queryClient.query({ ...someQueryOptions, staleTime: "static" })`.
- Use `useSuspenseQuery(someQueryOptions)` for unconditional queries and `useQuery({ ...someQueryOptions, enabled })` for conditional queries.
- Implement API mutations with `useMutation`; get the client with `getApi()` and run the endpoint Effect with `Effect.runPromise`.
- Use `ApiInput`, `ApiOutput`, and `ApiErrors` for types.
- Reuse exported query options' `.queryKey` for cache updates and invalidation.
- Export query-key factory objects beside their query options when cache operations need both exact and prefix keys. Prefer named methods, for example `someQueryKey.all()` and `someQueryKey.byId(id)`.
- Match typed domain errors from `ApiErrors` by their `_tag`.
