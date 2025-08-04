# ⚛️🗿 _Reactlith template_

## About

Minimal full-stack typescript/react monorepo template.

Used packages: https://github.com/stars/SashkaHavr/lists/reactlith

This project was created using CLI: https://github.com/SashkaHavr/reactlith

## Fast local startup

```sh
pnpm compose
```

## Development setup

1. Install [Node.js](https://nodejs.org/en)
2. Install [pnpm](https://pnpm.io/installation)
3. Install [turbo](https://turborepo.com/docs/getting-started/installation#global-installation)
4. Install [bun](https://bun.sh/docs/installation)
5. Make sure docker engine is running
6. Run `pnpm install` in root directory
7. Run `pnpm db:up` in [./packages/db/](./packages/db/)
8. In [./apps/web/](./apps/web/) create .env file with
9.

```conf
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres
AUTH_DEV_MAGIC_LINK=true
```

10. Run `pnpm dev` in [./apps/web/](./apps/web/)

## Production setup under domain

### Manual

1. Create .env file in root directory with:

```conf
BETTER_AUTH_URL=<Your domain>
BETTER_AUTH_SECRET=<Generated secret, e.g. with "openssl rand -base64 32">
```

2. Run

```sh
docker compose -f docker-compose.yaml up --build -d
```

3. Setup reverse proxy connection to _web_ service (e.g. with [Nginx Proxy Manager](https://nginxproxymanager.com/), [Caddy](https://caddyserver.com/), etc...)

### [Dokploy](https://dokploy.com/) / [Coolify](https://coolify.io/) / etc...

1. Use [docker-compose.yaml](docker-compose.yaml) for docker compose based deployment
2. Set following env config:

```conf
BETTER_AUTH_URL=<Your domain>
BETTER_AUTH_SECRET=<Generated secret, e.g. with "openssl rand -base64 32">
```

## pgAdmin

Docker compose includes pgadmin4 that is connected to the same docker network as database. To start it, set following variables in .env file:

```conf
PGADMIN_DEFAULT_EMAIL=<user@example.com>
PGADMIN_DEFAULT_PASSWORD=<something secure>
```
