---
name: api
description: Use when working with Effect RPC groups or their related schemas, repositories, services, domain errors, layers, and tests.
---

## Files

Keep each feature's implementation in `apps/api/src/features/<feature>/`:

- `packages/api-contract/src/features/<feature>.ts`: Shared Effect schemas, tagged domain errors, procedures, and one `<Feature>Api` RPC group.
- `repo.ts`: Database methods. Export one `<Feature>Repo` `Context.Service` containing all methods.
- `repo.test.ts`: Repository integration tests.
- `service.ts`: OPTIONAL file for complex domain logic. Export one `<Feature>Service` `Context.Service` containing all methods.
- `service.test.ts`: Service unit tests, when a service exists.
- `layer.ts`: Effect RPC handlers. Export one `<Feature>ApiLive` layer and, when useful, one layer with its services provided.
- `layer.test.ts`: API group unit tests.

Register the API group in `packages/api-contract/src/client.ts` and its live layer in `apps/api/src/app.ts`.

## API and Schema

- Define each feature with `RpcGroup.make` and each procedure with `Rpc.make` from `effect/rpc`. Prefix procedure tags with `<feature>.`.
- Always define procedure handlers with `Effect.fnUntraced`.
- Define every procedure success schema explicitly, including `Schema.Null` for void methods.
- Declare every expected error in the procedure's `error` option, using `Schema.Union` for multiple errors.
- Define inputs in the procedure's `payload` schema rather than HTTP params, query, or body wrappers.
- Keep business logic out of schema transformations. Use schemas for validation, coercion, and transport serialization.
- Rely on procedure schemas for input parsing, output encoding, field-level transformations, and removal of undeclared fields. Do not repeat those operations in handlers.
- Use Effect schemas such as `Schema.DateFromString` for values that require transport encoding.
- Create reusable unexported schema parts when needed.
- Implement the group with `<Feature>Api.toLayer(Effect.gen(...))`, returning a handler object keyed by the full procedure tags.
- Expose the combined group through `RpcServer.layerHttp` at `/api/rpc` with the HTTP protocol and `RpcSerialization.layerJson`. Clients must use the matching protocol and serialization, with a scope lasting for the client lifetime.
- Define middleware with `RpcMiddleware.Service`; use its `rpc` metadata for tags and annotations, and its `headers` for authentication and authorization.
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

- Define `Schema.TaggedError` for every expected domain failure.
- Add the error class to every procedure that can return it. RPC errors do not use HTTP status annotations.
- Give each `Schema.TaggedError` specific, self-describing tag. Expose structured context fields rather than a `message` or `reason` field.

## API Tests

- Test an API group through file-local `TestApi` and `TestClient` classes. Compose `TestApi` with `RpcGroup.make().merge(<Feature>Api)`, create the client with `RpcTest.makeClient(TestApi)`, and provide its dependencies in `TestClient.layerTest`. This in-memory transport does not test serialization.
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
