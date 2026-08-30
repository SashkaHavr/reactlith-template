---
name: api
description: Use when working with Effect HTTP API groups or their related schemas, repositories, services, domain errors, layers, and tests.
---

## Files

Keep each feature in `src/features/<feature>/`:

- `schema.ts`: Effect schemas, tagged domain errors, endpoints, and one `<Feature>Api` group.
- `repo.ts`: Database operations. Export one `<Feature>Repo` `Context.Service` containing all operations.
- `repo.test.ts`: Repository integration tests.
- `service.ts`: OPTIONAL file for complex domain logic. Export one `<Feature>Service` `Context.Service` containing all operations.
- `service.test.ts`: Service unit tests, when a service exists.
- `layer.ts`: Effect HTTP API handlers. Export one `<Feature>ApiLive` layer and, when useful, one layer with its services provided.
- `layer.test.ts`: API group unit tests.

Register the API group in `src/client.ts` and its live layer in `src/layer.ts`.

## API and Schema

- Define each feature as an `HttpApiGroup` and each operation as an `HttpApiEndpoint` with the appropriate HTTP method and path.
- Define every endpoint success schema explicitly, including `Schema.Null` for void operations.
- Declare every expected error in the endpoint's `error` option.
- Keep business logic out of schema transformations. Use schemas for validation, coercion, and transport serialization.
- Rely on endpoint schemas for input parsing, output encoding, field-level transformations, and removal of undeclared fields. Do not repeat those operations in handlers.
- Use Effect schemas such as `Schema.DateFromString` for values that require transport encoding.
- Create reusable unexported schema parts when needed.
- Implement the group with `HttpApiBuilder.group(Api, "<group>", Effect.fn(...))` and `handlers.handleAll(...)`.
- Handlers may contain straightforward logic and should call repositories directly when a service boundary is not justified.
- Put race-sensitive checks and writes in the same `Database.transaction`. Repository operations automatically use the transaction supplied through the Effect service context.

## Repository and Service

- Model repositories and services with `Context.Service`; expose their implementations with `Layer.effect`.
- Resolve dependencies by yielding their Effect services when constructing a repository, service, or API layer.
- Always define repository operations with `Effect.fnUntraced`.
- Always define service operations with `Effect.fn`.
- Each repository method should perform exactly one query. Perform database queries only in repositories.
- Return query results unchanged from repository methods. Do not map fields, add defaults, or derive values after the query.
- Services are optional and reserved for complex logic with a clear boundary. Never create a service that only delegates to a repository.
- Preserve repository output in services unless combining multiple results or replacing a field completely, such as replacing `imageKey` with an `imageUrl`.
- Convert unexpected database failures and broken invariants to defects with `Effect.orDie` or `Effect.die`.

## API Tests

- Test API groups through a client produced by `HttpApiTest.groups(Api, ["<group>"])`, not by invoking handlers directly.
- Use `@effect/vitest`'s `layer`, `it.layer`, and `it.effect` to provide test dependencies and run assertions inside `Effect.gen`.
- Replace services with `Layer.succeed(Service)(mock)` and type mocked methods from `Effect.Success<typeof Service.make>`.
- Assert expected failures with `const error = yield* Effect.flip(client.<group>.<operation>(...))` and `expect(error).toBeInstanceOf(<ErrorClass>)`.
- Never test defects or generic internal server errors through the API client.

## Repository Tests

- Use `DatabaseTest` and the real test database, and provide request-scoped services such as `CurrentUser` with test layers.
- Run repository tests with `@effect/vitest`'s `layer` and `it.effect`.
- Test successful values by yielding repository effects and asserting on the result.
- Test expected errors by flipping the effect with `Effect.flip` and asserting the error class.

## Domain errors

- Define `Schema.TaggedError` for every expected domain 4xx response.
- Set `{ httpApiStatus: <status> }` in the tagged error schema options and add the error class to every endpoint that can return it.
- Give each `Schema.TaggedError` specific, self-describing tag. Expose structured context fields rather than a `message` or `reason` field.
