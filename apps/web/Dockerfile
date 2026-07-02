FROM ghcr.io/voidzero-dev/vite-plus AS base

FROM base AS prepare
RUN vp add -g turbo
COPY --chown=vp:vp . .
RUN turbo prune @reactlith-template/web --docker

# Install and build
FROM base AS build
COPY --from=prepare /app/out/json/ .
RUN vp install --frozen-lockfile
COPY --from=prepare /app/out/full/ .
WORKDIR /app/apps/web
RUN vp build

# Run
FROM node:26.4-alpine AS runner

RUN apk --no-cache add curl
HEALTHCHECK --interval=1s --timeout=10s CMD [ "curl", "http://localhost:3000/trpc/health" ]

ENV NODE_ENV=production

WORKDIR /app
COPY --from=build /app/apps/web/dist .

USER node
EXPOSE 3000
CMD [ "node", "./server/index.mjs" ]
