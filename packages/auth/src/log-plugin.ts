import type { BetterAuthPlugin, InternalLogger } from "better-auth";

import { createAuthMiddleware } from "better-auth/plugins";

import { baseLogger } from "@reactlith-template/utils/logger";

export const logPlugin = {
  id: "log-plugin",
  hooks: {
    before: [
      {
        matcher: () => true,
        // oxlint-disable-next-line require-await
        handler: createAuthMiddleware(async (ctx) => {
          const start = Date.now();
          const logger = baseLogger.child({
            startTime: start,
            service: "better-auth",
            request: {
              id: crypto.randomUUID(),
              method: ctx.method,
              path: ctx.path,
            },
          });
          return {
            context: {
              ...ctx,
              context: {
                ...ctx.context,
                startTime: start,
                logger: {
                  error: (message, ...args) => logger.error({ args: args }, message),
                  info: (message, ...args) => logger.info({ args: args }, message),
                  success: (message, ...args) => logger.info({ args: args }, message),
                  warn: (message, ...args) => logger.warn({ args: args }, message),
                  debug: (message, ...args) => logger.debug({ args: args }, message),
                  level: "debug",
                } satisfies InternalLogger,
                requestLogger: logger,
              },
            },
          };
        }),
      },
    ],
    after: [
      {
        matcher: () => true,
        // oxlint-disable-next-line require-await
        handler: createAuthMiddleware(async (ctx) => {
          const startTime = ctx.context.startTime as number;
          const endTime = Date.now();
          const logger = ctx.context.requestLogger as typeof baseLogger;
          logger.setBindings({
            endTime: endTime,
            duration: endTime - startTime,
          });
          const statusCode =
            typeof ctx.context.returned === "object" &&
            ctx.context.returned &&
            "statusCode" in ctx.context.returned &&
            ctx.context.returned.statusCode !== undefined
              ? ctx.context.returned.statusCode
              : 200;
          if (ctx.context.returned instanceof Error) {
            logger.setBindings({
              response: {
                statusCode: statusCode,
              },
            });
            logger.error(ctx.context.returned);
          } else {
            logger.info({
              response: {
                statusCode: statusCode,
              },
            });
          }
        }),
      },
    ],
  },
} satisfies BetterAuthPlugin;
