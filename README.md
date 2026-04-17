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
4. In [./apps/web/](./apps/web/) create .env file with:

```conf
DATABASE_URL=<your database url>
TEST_AUTH=true
```

6. Run `bun dev` in [./apps/web/](./apps/web/)
