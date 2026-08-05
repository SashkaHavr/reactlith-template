FROM oven/bun:1.3.14-slim AS base
WORKDIR /app

FROM base AS prepare
COPY . .
RUN bun ci --filter '.'
RUN bunx --no-install turbo prune @reactlith-template/web --docker

FROM base AS build
COPY --from=prepare /app/out/json/ .
RUN bun ci
COPY --from=prepare /app/out/full/ .
RUN bun run build

FROM base

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --start-interval=1s \
  CMD [ "bun", "-e", "fetch('http://localhost:3000/api/health/live').then(response => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))" ]

ENV NODE_ENV=production

COPY --from=build /app/apps/web/dist ./apps/web

USER bun
EXPOSE 3000
WORKDIR /app/apps/web
CMD [ "bun", "run", "./server/index.mjs" ]
