---
name: trpc-procedures
description: Use when creating or updating tRPC routers and procedures, including permissions and router registration.
---

# TRPC Procedures

- Explicitly specify `.input(...)` and `.output(...)`
- Use appropriate procedure from `src/procedures/*`.
- Don't extract schemas from procedure definition if they are not reused in other places.
- Use `z.undefined()` for no-output mutations.
- Throw `TRPCError` with explicit `code` and `message`.
- Use `ctx.db`; prefer Drizzle query API v2 (`ctx.db.query.*.findFirst/findMany`) except where joins/aggregates require query builder.
- Consider extracting code from procedure into separate function ONLY IF:
  - It's reused in several places
  - It performs a single concrete action and is > 50 lines
