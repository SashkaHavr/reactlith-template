import type { BetterAuthPlugin, InternalLogger } from "better-auth";
import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";

import { identifyUser } from "@reactlith-template/utils/log";
import type { LogType } from "@reactlith-template/utils/log";

export const logPlugin = {
  id: "log-plugin",
  hooks: {
    before: [
      {
        matcher: () => true,
        handler: createAuthMiddleware(async (ctx) => {
          const log =
            ctx.request !== undefined ? (ctx.request as Request & { log: LogType }).log : undefined;
          log?.set({ package: "auth" });
          identifyUser(log, await getSessionFromCtx(ctx));
          return {
            context: {
              ...ctx,
              context: {
                ...ctx.context,
                logger: log as unknown as InternalLogger,
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
          const log =
            ctx.request !== undefined ? (ctx.request as Request & { log: LogType }).log : undefined;
          if (
            ctx.context.returned instanceof Error &&
            (!("statusCode" in ctx.context.returned) ||
              (ctx.context.returned.statusCode as number) > 400)
          ) {
            log?.error(ctx.context.returned);
          }
        }),
      },
    ],
  },
} satisfies BetterAuthPlugin;
