---
name: trpc-router
description: Use when working with tRPC routers or their related schemas, repositories, services, domain errors, and tests.
---

## Files

Keep each feature in `src/routers/<feature>/`:

- `errors.ts`: Tagged domain errors. Export each error class by name.
- `repo.ts`: Database operations. Export one `<feature>Repo` object containing all operations.
- `repo.test.ts`: Repository integration tests.
- `service.ts`: Complex domain logic, when needed. Export one `<feature>Service` object containing all operations.
- `service.test.ts`: Service unit tests, when a service exists.
- `router.ts`: tRPC procedures. Export one `<feature>Router`.
- `router.test.ts`: Router unit tests.
- `schema.ts`: Procedure schemas. Export only `<operation>Input` and `<operation>Output` schemas.

Register the router in `src/index.ts`.

## Router and Schema

- Use an appropriate procedure from `src/procedures/*`.
- Define every procedure output explicitly, including `z.null()` for void mutations.
- Schema transforms must not encode business logic. Keep business logic in the application layer and use schemas only for validation, coercion, and serialization.
- Output schemas apply field-level transformations and remove extra fields, so do not repeat either operation in the procedure handler.
- tRPC input schemas already remove extra fields before passing the input to the procedure handler; do not remove them again in the handler.
- Use `dateInput` and `dateOutput` for date input and output schemas.
- Create reusable unexported schema parts when needed.
- Routers may contain straightforward logic and should call repositories directly when a service boundary is not justified.
- Put race-sensitive checks inside `callInTransaction`. Repositories automatically use the active transaction through async context.

## Repository and Service

- Each repository method should perform exactly one query. Perform database queries only in repositories.
- Return query results unchanged from repository methods. Do not map fields, add defaults, or derive values after the query.
- Services are optional and reserved for complex logic with a clear boundary. Never create a service that only delegates to a repository.
- Preserve repository output in services unless combining multiple results or replacing a field completely, such as replacing `imageKey` with an `imageUrl`.
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

## Router Tests

- Test routers through `featureRouter.createCaller(...)`, not by invoking handlers directly.
- Declare dependency mocks with `vi.hoisted` and `vi.fn<typeof repo.method>()`, call `vi.mock` before importing the router, and reset mocks in `beforeEach`.
- Assert errors as `await expect(result).rejects.toMatchObject({ cause: expect.any(<ErrorClass>) });`
- Never test `INTERNAL_SERVER_ERROR`.

## Repository Tests

- Use `setupRepoTest()` and its real database. Execute repository calls through `testContext.inUserContext(...)` so app and user async contexts exist.
- Use `expect(result.unwrap()).toMatchObject(<value>)` to test successful values.
- Use `expect(result).toMatchObject({ error: expect.any(<ErrorClass>) });` to test errors.
- Use `expect(result).rejects.toThrow(Panic);` to test panics.
- Never test errors that are not defined by either `panic` or a tagged error class.

## Error Classes

- Define a domain error class for every 4xx error.
- Define a separate tagged error class for each error reason.
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
