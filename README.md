# *Reactlith template*

## About

Minimal react monorepo template

Stack:
- [React](https://react.dev/) + [Vite](https://vite.dev/) (SPA)
- [TanStack Router](https://tanstack.com/router/latest)
- [tRPC](https://trpc.io/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Drizzle](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/)
- [Hono](https://hono.dev/) + [Bun](https://bun.sh/) (API server)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (web components)
- [T3 Env](https://env.t3.gg/)
- [pnpm](https://pnpm.io/)
- [Turborepo](https://turborepo.com/)
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)
- ...

## Fast local startup

> [!WARNING]
>
> This startup guide is for demonstration/testing purposes and local usage only. Do NOT use in production environments due to lack of security/stability guarantees.

1. Create PostgreSQL docker container with `docker run -d --name pg-reactlith -e POSTGRES_PASSWORD=mysecretpassword -v pgdata-reactlith:/var/lib/postgresql/data -p 5432:5432 postgres`
2. Copy [.env.example](./.env.example) content int [.env](./.env)
3. Run `docker-compose up --build -d`

## Development setup

1. Install [Node.js](https://nodejs.org/en)
2. Install [pnpm](https://pnpm.io/installation)
3. Install [turbo](https://turborepo.com/docs/getting-started/installation#global-installation)
4. Install [bun](https://bun.sh/docs/installation)
5. Run `pnpm install` in root directory
6. Run `pnpm dev` in root directory
7. Look at console output and set missing environmental variables in [apps/api/.env](./apps/api/.env). Info about environmental variables can be found in [packages/env](./packages/env/)
8. Copy DB environmental variables into [packages/db/.env](./package/db/.env) to work with drizzle-kit