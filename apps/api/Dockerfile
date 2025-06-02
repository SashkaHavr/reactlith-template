FROM oven/bun:slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV TURBO_TELEMETRY_DISABLED=1
RUN bun install -g pnpm
RUN bun install -g turbo

FROM base AS builder
# Set working directory
WORKDIR /app
COPY . .
# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune @reactlith-template/api --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile
# Build
COPY --from=builder /app/out/full/ .
RUN pnpm build

FROM oven/bun:slim AS runner

RUN apt-get -y update && apt-get -y install curl
HEALTHCHECK CMD [ "curl", "http://localhost:3000/trpc/health" ]

WORKDIR /app
COPY --from=installer /app/apps/api/dist/index.js .

USER bun
EXPOSE 3000/tcp

ENV NODE_ENV=production
CMD [ "bun", "run", "index.js" ]