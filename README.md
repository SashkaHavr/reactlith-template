# ⚛️🗿 *Reactlith template*

## About

Minimal react monorepo template.

Used packages: https://github.com/stars/SashkaHavr/lists/reactlith

## Fast local startup

```sh
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up --build -d
```

## Development setup

1. Install [Node.js](https://nodejs.org/en)
2. Install [pnpm](https://pnpm.io/installation)
3. Install [turbo](https://turborepo.com/docs/getting-started/installation#global-installation)
4. Install [bun](https://bun.sh/docs/installation)
5. Create PostgreSQL docker container 
```sh
docker run -d --name pg-reactlith -e POSTGRES_PASSWORD=mysecretpassword -v pgdata-reactlith:/var/lib/postgresql/data -p 5432:5432 postgres
```
6. In [apps/api/](./apps/api/) **AND** [packages/db/](./package/db/) create .env file with
```conf
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres
AUTH_DEV_MAGIC_LINK=true
```
7. Run `pnpm install` in root directory
8. Run `pnpm push` in [packages/db/](./package/db/)
9. Run `pnpm dev` in root directory

## Production setup under domain

### Manual
1. Create .env file in root directory with:
```conf
BETTER_AUTH_URL=<Your domain>
```
2. Run
```sh
docker compose -f docker-compose.yaml up --build -d
```
3. Setup reverse proxy connection to *web* service (e.g. with [Nginx Proxy Manager](https://nginxproxymanager.com/), [Caddy](https://caddyserver.com/), etc...)

### [Dokploy](https://dokploy.com/) / [Coolify](https://coolify.io/) / etc...
1. Use [docker-compose.yaml](docker-compose.yaml) for docker compose based deployment
2. Set following env config:
```conf
BETTER_AUTH_URL=<Your domain>
```