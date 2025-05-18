FROM node:slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm add -g turbo
ENV TURBO_TELEMETRY_DISABLED=1

FROM base AS builder
# Set working directory
WORKDIR /app
COPY . .
# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune @reactlith-template/web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile
# Build
COPY --from=builder /app/out/full/ .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm build

FROM node:slim AS runner
WORKDIR /app
COPY --from=installer /app/apps/web/dist dist

RUN npm i -g serve
EXPOSE 3000/tcp

CMD [ "serve", "-s", "dist" ]
