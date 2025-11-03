FROM oven/bun:1.3.1-alpine AS bun

FROM bun AS base

# Install and build
FROM base AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN --mount=type=secret,id=TURBO_TEAM,env=TURBO_TEAM \
    --mount=type=secret,id=TURBO_TOKEN,env=TURBO_TOKEN \
    bun run build

# Run
FROM bun AS runner

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
