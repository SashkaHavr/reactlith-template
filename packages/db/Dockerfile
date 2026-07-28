FROM oven/bun:1.3.14-slim AS base
WORKDIR /app

FROM base AS prepare
COPY . .
RUN bun ci --filter '.'
RUN bunx --no-install turbo prune @reactlith-template/db --docker

FROM base AS build

COPY --from=prepare /app/out/json/ .
RUN bun ci
COPY --from=prepare /app/out/full/ .
CMD [ "bun", "--filter", "@reactlith-template/db", "push" ]
