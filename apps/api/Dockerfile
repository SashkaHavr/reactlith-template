FROM ghcr.io/voidzero-dev/vite-plus:1.3.0 AS base
WORKDIR /app

FROM base AS prepare
COPY . .
RUN vp add -g turbo@$(node -p "require('./package.json').devDependencies.turbo")
RUN turbo prune @reactlith-template/api --docker

FROM base AS build
COPY --from=prepare /app/out/json/ .
RUN vp install --frozen-lockfile
COPY --from=prepare /app/out/full/ .
RUN vpr api#build

FROM node:26.12.0-slim
WORKDIR /app

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --start-interval=1s \
  CMD [ "node", "-e", "fetch('http://localhost:3001/api/health/live').then(response => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))" ]

ENV NODE_ENV=production

COPY --from=build /app/apps/api/dist ./dist

USER node
EXPOSE 3001
CMD [ "node", "dist/server.mjs" ]
