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
RUN turbo prune @reactlith-template/db --docker

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

WORKDIR /app/packages/db
CMD [ "bun", "./src/push.ts" ]
