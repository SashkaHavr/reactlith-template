---
name: trpc-router-tests
description: Use when writing or updating tests for tRPC routers using bun:test and the shared PGlite test database.
---

# TRPC Router Tests

- Use `bun:test`, `createCallerFactory`, `router`, and `getTestDb()`.
- Build a caller around only the router under test.
- In `beforeEach`, provide a mocked admin auth context
- NEVER use `db` directly in test. Extract `db` usage in `given*` helpers for preconditions and in `then*` helpers for postconditions
- Add local `given*` helpers that insert real DB rows and return created records.
- If `then*` helper is used a single time, inline it into `expect`: `expect(await thenId()).toBe(1)`
- To check promise rejection, store promise in the variable and after then use `await expect(promise).rejects....`
