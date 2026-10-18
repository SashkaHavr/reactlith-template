FROM ghcr.io/voidzero-dev/vite-plus:1.3.0 AS base
WORKDIR /app

FROM base AS prepare
COPY . .
RUN vp add -g turbo@$(node -p "require('./package.json').devDependencies.turbo")
RUN turbo prune @reactlith-template/db --docker

FROM base

COPY --from=prepare /app/out/json/ .
RUN vp install --frozen-lockfile
COPY --from=prepare /app/out/full/ .
CMD [ "vpr", "db#push" ]
