FROM ghcr.io/voidzero-dev/vite-plus:0.2.5 AS base

FROM base AS prepare
RUN vp add -g turbo
COPY --chown=vp:vp . .
RUN turbo prune @reactlith-template/db --docker

FROM base AS build

COPY --from=prepare /app/out/json/ .
RUN vp install --frozen-lockfile
COPY --from=prepare /app/out/full/ .
CMD [ "vpr", "--filter", "@reactlith-template/db", "push" ]
