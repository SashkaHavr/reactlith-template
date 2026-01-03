# ⚛️🗿 _Reactlith template_

## About

Minimal full-stack typescript/react monorepo template.

Used packages: https://github.com/stars/SashkaHavr/lists/reactlith

This project was created using CLI: https://github.com/SashkaHavr/reactlith

## Fast local startup

```sh
bun compose
```

## Development setup

1. Install [bun](https://bun.sh/docs/installation)
2. Make sure docker engine is running
3. Run `bun install` in root directory
4. Run `bun db:up` in [./packages/db/](./packages/db/)
5. In [./apps/web/](./apps/web/) create .env file with:

```conf
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres
AUTH_DEV_MAGIC_LINK=true
```

10. Run `bun dev` in [./apps/web/](./apps/web/)
