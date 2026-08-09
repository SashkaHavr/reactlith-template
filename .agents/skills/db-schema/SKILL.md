---
name: db-schema
description: Use when defining or changing the Drizzle database schema.
---

- Define PostgreSQL tables in `packages/db/src/schema/` with `snakeCase.table`.
- Organize tables into files by domain. Multiple tables in one file are acceptable.
- For every table, spread `baseTable<"table-name">()` into its columns to add a branded UUIDv7 `id`, `createdAt`, and `updatedAt`.
- Use the helpers in `packages/db/src/utils/foreign-keys.ts` instead of raw UUID references.
- Export every schema module from `packages/db/src/schema/index.ts`. Update `packages/db/src/relations.ts` when Drizzle relational queries require the relation.
- Preserve branded IDs across application boundaries with `idBranded` and `IdBranded` from the package's `./id-branded` export.
- Never run the `push` command.
