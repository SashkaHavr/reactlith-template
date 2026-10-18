FROM ghcr.io/voidzero-dev/vite-plus:1.3.0 AS base
WORKDIR /app

FROM base AS prepare
COPY --chown=vp:vp . .
RUN vp add -g turbo@$(node -p "require('./package.json').devDependencies.turbo")
RUN turbo prune @reactlith-template/db --docker

FROM base

COPY --from=prepare --chown=vp:vp /app/out/json/ .
RUN vp install --frozen-lockfile
COPY --from=prepare --chown=vp:vp /app/out/full/ .
CMD [ "vpr", "db#push" ]
