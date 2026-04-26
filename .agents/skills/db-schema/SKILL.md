---
name: db-schema
description: Use when adding or changing database schemas, Drizzle tables, schema exports, relations.
---

# DB Schema

- Add tables in `packages/db/src/schema/*.ts`; export them from `packages/db/src/schema/index.ts`.
- Use `pgTable`, `baseTable` or `baseTablePublicEntity`, and helpers from `#utils/foreign-keys.ts`.
- Add indexes for lookup/filter columns and `uniqueIndex()` for domain uniqueness.
- Put table relations in `packages/db/src/relations.ts`.
- NEVER edit or create migrations manually, use provided `db:generate` command. If you need to change migration that was not commited yet, just delete migration folder and regenerate full migration.
