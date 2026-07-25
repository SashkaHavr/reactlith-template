FROM oven/bun:1.3.14-slim AS base
WORKDIR /app

FROM base AS prepare
RUN bun add -g turbo@^2
COPY . .
RUN turbo prune @reactlith-template/web --docker

# Install and build
FROM base AS build
COPY --from=prepare /app/out/json/ .
RUN bun ci
COPY --from=prepare /app/out/full/ .
RUN bun run build

# Run
FROM base AS runner

RUN apt-get update
RUN apt-get install -y --no-install-recommends curl
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

HEALTHCHECK --interval=1s --timeout=10s CMD [ "curl", "http://localhost:3000/trpc/health" ]

ENV NODE_ENV=production

COPY --from=build /app/apps/web/dist .

USER bun
EXPOSE 3000
CMD [ "bun", "run", "./server/index.mjs" ]
