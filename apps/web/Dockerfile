FROM oven/bun:1.3.2-alpine AS base

# Generate a partial monorepo
FROM base AS turbo
RUN bun install -g turbo@2.6.1
WORKDIR /app
COPY . .
RUN turbo prune @reactlith-template/web --docker

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

RUN apk --no-cache add curl
HEALTHCHECK --interval=10s --timeout=10s CMD [ "curl", "http://localhost:3000/trpc/health" ]

ENV NODE_ENV=production

COPY --from=build /app/apps/web/.output /app/web/.output

COPY /packages/db/drizzle /app/db/drizzle
COPY --from=build /app/packages/db/dist /app/db

COPY --from=build /app/packages/auth/dist /app/auth

USER bun
EXPOSE 3000
CMD [ "sh", "-c", "cd /app/db && bun run migrate.js && cd /app/auth && bun run generate-test-users.js && cd /app/web && bun run .output/server/index.mjs" ]
