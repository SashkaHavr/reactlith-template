FROM oven/bun:1.4.2-slim AS base
WORKDIR /app

FROM base AS prepare
COPY . .
RUN bun add -g turbo@$(bun --print "require('./package.json').devDependencies.turbo")
RUN turbo prune @reactlith-template/db --docker

FROM base

COPY --from=prepare /app/out/json/ .
RUN bun ci
COPY --from=prepare /app/out/full/ .
CMD [ "bun", "--filter", "@reactlith-template/db", "push" ]
