---
name: api
description: Use when working with Effect HTTP API groups or their related schemas, repositories, services, domain errors, layers, and tests.
---

## Files

Keep each feature in `src/features/<feature>/`:

- `schema.ts`: Effect schemas, tagged domain errors, endpoints, and one `<Feature>Api` group.
- `repo.ts`: Database methods. Export one `<Feature>Repo` `Context.Service` containing all methods.
- `repo.test.ts`: Repository integration tests.
- `service.ts`: OPTIONAL file for complex domain logic. Export one `<Feature>Service` `Context.Service` containing all methods.
- `service.test.ts`: Service unit tests, when a service exists.
- `layer.ts`: Effect HTTP API handlers. Export one `<Feature>ApiLive` layer and, when useful, one layer with its services provided.
- `layer.test.ts`: API group unit tests.

Register the API group in `src/client.ts` and its live layer in `src/layer.ts`.

## API and Schema

- Define each feature as an `HttpApiGroup` and each endpoint as an `HttpApiEndpoint` with the appropriate HTTP method and path.
- Always define endpoint handler with `Effect.fnUntraced`.
- Define every endpoint success schema explicitly, including `Schema.Null` for void methods.
- Declare every expected error in the endpoint's `error` option.
- Keep business logic out of schema transformations. Use schemas for validation, coercion, and transport serialization.
- Rely on endpoint schemas for input parsing, output encoding, field-level transformations, and removal of undeclared fields. Do not repeat those operations in handlers.
- Use Effect schemas such as `Schema.DateFromString` for values that require transport encoding.
- Create reusable unexported schema parts when needed.
- Implement the group with `HttpApiBuilder.group(Api, "<group>", Effect.fn(...))` and `handlers.handleAll(...)`.
- Handlers may contain straightforward logic and should call repositories directly when a service boundary is not justified.
- Put race-sensitive checks and writes in the same `Database.transaction`. Repository methods automatically use the transaction supplied through the Effect service context.

## Repository and Service

- Model repositories and services with `Context.Service`; expose their implementations with `Layer.effect`.
- Resolve dependencies by yielding their Effect services when constructing a repository, service, or API layer.
- Always define repository methods with `Effect.fnUntraced`.
- Always define service methods with `Effect.fn`.
- Each repository method should perform exactly one query. Perform database queries only in repositories.
- Return query results unchanged from repository methods. Do not map fields, add defaults, or derive values after the query.
- Services are optional and reserved for complex logic with a clear boundary. Never create a service that only delegates to a repository.
- Preserve repository output in services unless combining multiple results or replacing a field completely, such as replacing `imageKey` with an `imageUrl`.
- Convert unexpected database failures and broken invariants to defects with `Effect.orDie` or `Effect.die`.

## Domain errors

- Define `Schema.TaggedError` for every expected domain 4xx response.
- Set `{ httpApiStatus: <status> }` in the tagged error schema options and add the error class to every endpoint that can return it.
- Give each `Schema.TaggedError` specific, self-describing tag. Expose structured context fields rather than a `message` or `reason` field.

## API Tests

- Test an API group through file-local `TestApi` and `TestClient` classes. Create the client with `HttpApiTest.groups(TestApi, ["<group>"])` and provide its dependencies in `TestClient.layerTest`.
- Define dependency mocks once at module scope. Type each mocked method with `vi.fn<typeof Service.Service.method>()`.
- Configure mocks inside the test that uses them.
- Never create tests for middleware or for errors included in an API contract by middleware.

## Repository Tests

- Use `DatabaseTest` to provide the `Database` layer.
- Define small file-local seed helpers with `Effect.fn`. Seed required records explicitly inside each test.

## Test Style

- Use `@effect/vitest`'s named `layer` overload to provide shared test dependencies and `it.effect` with `Effect.fn(function* () { ... })` for each test.
- Keep fixture seeding, service or client acquisition, and mock configuration together in the arrange section. Leave blank lines between the arrange, act, and assert sections.
- Name a successful method result `result`. Use specific names such as `<method>Result` only when a lifecycle test produces multiple results.
- Assert expected failures with `const error = yield* method.pipe(Effect.flip)` followed by `expect(error).toBeInstanceOf(ErrorClass)`.
- NEVER test outcomes that are not specified by the test subject's contract.
