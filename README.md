# ⚛️🗿 _Reactlith template_

## About

Minimal full-stack typescript/react monorepo template.

Used packages: https://github.com/stars/SashkaHavr/lists/reactlith

## Fast local startup

```sh
bun compose
```

## Development setup

1. Use provided devcontainer
2. Run `bun dev` in [./apps/web/](./apps/web/)

**OR**

1. Install [bun](https://bun.sh/docs/installation)
2. Run `bun install` in root directory
3. Run `bun db:migrate` in [./packages/db/](./packages/db/)
4. Run `bun exec "TEST_AUTH=true bun run generate-test-users"` in [./packages/auth/](./packages/auth/)
5. In [./apps/web/](./apps/web/) create .env file with:

```conf
DATABASE_URL=<your database url>
TEST_AUTH=true
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=supersecretkey
```

6. Run `bun dev` in [./apps/web/](./apps/web/)
