FROM oven/bun:1.3.11-alpine as base

FROM base AS prepare
WORKDIR /app
RUN bun add -g turbo@^2
COPY . .
RUN turbo prune @reactlith-template/emulate --docker

FROM base AS runner
WORKDIR /app
COPY --from=prepare /app/out/json/ .
RUN bun ci --production
COPY --from=prepare /app/out/full/ .
COPY /apps/emulate/emulate.config.yaml ./apps/emulate

WORKDIR /app/apps/emulate
CMD [ "bunx", "emulate", "--service", "google" ]
