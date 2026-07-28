FROM oven/bun:1.3.14-slim AS base
WORKDIR /app

FROM base AS prepare
COPY . .
RUN bun ci --filter '.'
RUN bunx --no-install turbo prune @reactlith-template/web --docker

# Install and build
FROM base AS build
COPY --from=prepare /app/out/json/ .
RUN bun ci
COPY --from=prepare /app/out/full/ .
RUN bun run build

FROM base AS production-dependencies
COPY --from=prepare /app/out/json/ .
RUN bun ci --production

# Run
FROM base AS runner

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD [ "bun", "-e", "fetch('http://localhost:3000/health/live').then(response => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))" ]

ENV NODE_ENV=production

COPY --exclude=**/package.json --exclude=**/bunfig.toml --exclude=**/bun.lock --from=production-dependencies /app .
COPY --from=build /app/apps/web/dist ./apps/web

USER bun
EXPOSE 3000
WORKDIR /app/apps/web
CMD [ "bun", "run", "./server/index.mjs" ]
