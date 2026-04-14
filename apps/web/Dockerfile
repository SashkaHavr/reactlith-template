FROM node:25.9.0-alpine AS base

FROM base AS pnpm
RUN npm install -g pnpm

# Install and build
FROM pnpm AS build
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run --filter @reactlith-template/web --filter @reactlith-template/auth --filter @reactlith-template/db build

FROM pnpm AS install
WORKDIR /app
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY package.json .

COPY /packages/db/package.json ./packages/db/

RUN pnpm install --frozen-lockfile --production

# Run
FROM base AS runner

RUN apk --no-cache add curl
HEALTHCHECK --interval=1s --timeout=10s CMD [ "curl", "http://localhost:3000/trpc/health" ]

ENV NODE_ENV=production

WORKDIR /app
COPY --from=install /app .
COPY /packages/db/drizzle ./packages/db/drizzle
COPY --from=build /app/packages/db/dist ./packages/db
COPY --from=build /app/packages/auth/dist ./packages/auth

COPY --from=build /app/apps/web/dist .

USER node
EXPOSE 3000
CMD [ "node", "./server/index.mjs" ]
