---
name: trpc-procedures
description: Use when creating or updating tRPC routers and procedures, including permissions and router registration.
---

# TRPC Procedures

- Always explicitly specify `.output(...)`
- Use appropriate procedure from `src/procedures/*`.
- Don't extract schemas from procedure definition if they are not reused in other places.
- Use `z.undefined()` for no-output mutations.
- Always extract common fields of create and update procedure input schema into `data: ...` schema.
- Use only `TRPCError` with explicit `code` and `message`. Use `INTERNAL_SERVER_ERROR` code for internal errors
- Keep code inside procedure. Extract in separate function ONLY IF it's reused in several places.
- NEVER extract one-liners into separate function
- Run targeted `bun test router.name` if you made changes in trpc router
