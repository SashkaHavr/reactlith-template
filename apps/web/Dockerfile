FROM oven/bun:1.3.3-alpine AS base

# Install and build
FROM base AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run --filter @reactlith-template/web --filter @reactlith-template/auth --filter @reactlith-template/db build

# Run
FROM base AS runner

RUN apk --no-cache add curl
HEALTHCHECK --interval=1s --timeout=10s CMD [ "curl", "http://localhost:3000/trpc/health" ]

ENV NODE_ENV=production


WORKDIR /infra
COPY /packages/db/drizzle ./db/drizzle
COPY --from=build /app/packages/db/dist ./db
COPY --from=build /app/packages/auth/dist ./auth

WORKDIR /app
COPY --from=build /app/apps/web/.output .

USER bun
EXPOSE 3000
CMD [ "sh", "-c", "bun run --cwd /infra/db /infra/db/migrate.js && bun run /infra/auth/generate-test-users.js && bun run ./server/index.mjs" ]
