FROM oven/bun:1.3.2-alpine AS base

# Generate a partial monorepo
FROM base AS turbo
RUN bun install -g turbo@2.6.1
WORKDIR /app
COPY . .
RUN turbo prune @reactlith-template/db-manager --docker

# Install and build
FROM base AS build
WORKDIR /app
COPY --from=turbo /app/out/json/ .
RUN bun install --frozen-lockfile
COPY --from=turbo /app/out/full/ .
RUN --mount=type=secret,id=TURBO_TEAM,env=TURBO_TEAM \
    --mount=type=secret,id=TURBO_TOKEN,env=TURBO_TOKEN \
    bun run build

# Run
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY /packages/db/drizzle ./drizzle
COPY --from=build /app/apps/db-manager/dist .

USER bun
ENTRYPOINT [ "bun", "run", "index.js" ]
