# AGENTS.md

## Monorepo

- Always use `bun` as package manager and task runner.
- Always run `bun fix` after making any changes. NEVER RUN ANY OTHER CHECK COMMANDS.
- Never run `bun dev` or `bun build` in any package unless explicitly requested.

## General code style

- Do not access `process.env` directly outside the env package. Define env vars in `packages/env/src/*`.
- Prefer named top-level `function` declarations over top-level arrow functions.
- Prefer arrow functions for local handlers/callbacks inside functions/components/hooks.
