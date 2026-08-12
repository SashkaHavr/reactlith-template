---
name: trpc-router
description: Use when creating or changing tRPC routers.
---

## Files

Keep each feature in `/src/routers/<feature>/`:

- `errors.ts`: Tagged domain errors. Export each error class by name.
- `repo.ts`: Database operations. Export one `<feature>Repo` object containing all operations.
- `repo.test.ts`: Repository integration tests.
- `service.ts`: Complex domain logic. Export one `<feature>Service` object containing all operations.
- `service.test.ts`: Service unit tests.
- `router.ts`: tRPC procedures. Export one `<feature>Router`.
- `router.test.ts`: Router unit tests.
- `schema.ts`: Procedure schemas. Export only `<operation>Input` and `<operation>Output` schemas.

Register the router in `packages/trpc/src/index.ts`.

## Router and Schema

- Use an appropriate procedure from `src/procedures/*`.
- Define every procedure output explicitly, including `z.null()` for void mutations.
- tRPC output schemas already apply their transformations, including removing extra fields; do not repeat them in the procedure handler.
- tRPC input schemas already remove extra fields before passing the input to the procedure handler; do not remove them again in the handler.
- Use `dateInput` and `dateOutput` for date input and output schemas.
- Create reusable unexported schema parts when needed.
- Put race-sensitive checks inside `callInTransaction`. Repositories automatically use the active transaction through async context.

## Repository and Service

- Each repository method should perform exactly one query. Perform database queries only in repositories.
- Put complex domain logic in service functions.
- Resolve dependencies through async context.
- Always use the transaction DB when `getTransactionContext()` is present.
- Use `panic` for broken invariants that should produce a 5xx error.
- Return the value directly when no expected errors exist.
- When expected errors are possible, return `Result.err(TaggedError)` for errors and `Result.ok(value)` for success.
- Do not use `try/catch` in repositories or services. Wrap fallible synchronous operations with `Result.try` and asynchronous operations with `Result.tryPromise`:

```ts
const result = Result.try({
  try: () => <operation>,
  catch: (cause) => new <ErrorClass>({ cause }),
});

const result = await Result.tryPromise({
  try: () => <operation>,
  catch: (cause) => new <ErrorClass>({ cause }),
});
```

- Service functions may call repository methods directly when doing so keeps the service's public API smaller.

## Router Tests

- Test routers through `featureRouter.createCaller(...)`, not by invoking handlers directly.
- Declare dependency mocks with `vi.hoisted` and `vi.fn<typeof repo.method>()`, call `vi.mock` before importing the router, and reset mocks in `beforeEach`.
- Assert errors as `await expect(result).rejects.toMatchObject({ cause: expect.any(<ErrorClass>) });`

## Repository Tests

- Use `setupRepoTest()` and its real database. Execute repository calls through `testContext.inUserContext(...)` so app and user async contexts exist.
- Use `expect(result.unwrap()).toMatchObject(<value>)` to test successful values.
- Use `expect(result).toMatchObject({ error: expect.any(<ErrorClass>) });` to test errors.

## Error Classes

- Define a domain error class for every 4xx error.
- Throw domain errors from routers as `throw new TRPCError({ code: "<TRPC_ERROR_CODE>", error: new <ErrorClass>() });`.
- Map errors returned by repositories and services in routers:

```ts
if (<result>.isErr()) {
  throw <result>.error.match({
    <ErrorClass>: (error) => new TRPCError({ code: "<TRPC_ERROR_CODE>", error }),
  });
}
```

- Use a fixed message when the error constructor takes no arguments.
- Compute the message from the constructor arguments when it takes arguments.

```ts
export class <ErrorClass> extends TaggedError("<ErrorClass>")<{
  <arg>: string;
  message: string;
}> {
  constructor(args: { <arg>: string }) {
    super({
      ...args,
      message: `Message with ${args.<arg>} argument`,
    });
  }
}
```
