FROM oven/bun:1.3.11-alpine AS base

FROM base AS prepare
WORKDIR /app
RUN bun add -g turbo@^2
COPY . .
RUN turbo prune @reactlith-template/web --docker

# Install and build
FROM base AS build
WORKDIR /app
COPY --from=prepare /app/out/json/ .
RUN bun ci
COPY --from=prepare /app/out/full/ .
RUN bun run --filter @reactlith-template/web --filter @reactlith-template/db build

# Run
FROM base AS runner

RUN apk --no-cache add curl
HEALTHCHECK --interval=1s --timeout=10s CMD [ "curl", "http://localhost:3000/trpc/health" ]

ENV NODE_ENV=production

WORKDIR /app
COPY /packages/db/drizzle ./packages/db/drizzle
COPY --from=build /app/packages/db/dist ./packages/db
COPY --from=build /app/packages/auth/dist ./packages/auth
COPY --from=build /app/apps/web/dist ./apps/web

WORKDIR /app/apps/web
USER bun
EXPOSE 3000
CMD [ "bun", "run", "./server/index.mjs" ]
