FROM oven/bun:slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV TURBO_TELEMETRY_DISABLED=1
RUN bun install -g pnpm
RUN bun install -g turbo

# Generate a partial monorepo with a pruned lockfile for a target workspace.
FROM base AS turbo
WORKDIR /app
COPY . .
RUN turbo prune @reactlith-template/api --docker

# Install and build
FROM base AS builder
WORKDIR /app
COPY --from=turbo /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=turbo /app/out/full/ .

# Run
FROM oven/bun:slim AS runner
WORKDIR /app
COPY --from=builder /app .

RUN apt-get -y update && apt-get -y install curl
HEALTHCHECK --interval=10s --timeout=10s CMD [ "curl", "http://localhost:3000/trpc/health" ]

USER bun
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "bun", "run", "apps/api/src/index.ts" ]
