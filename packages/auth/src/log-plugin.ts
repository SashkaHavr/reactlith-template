import type { BetterAuthPlugin, InternalLogger } from "better-auth";
import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";

import { getLogger, identifyUser } from "@reactlith-template/utils/logger";

export const logPlugin = {
  id: "log-plugin",
  hooks: {
    before: [
      {
        matcher: () => true,
        handler: createAuthMiddleware(async (ctx) => {
          const log = getLogger(ctx.request);
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
          const log = getLogger(ctx.request);
          if (ctx.context.returned instanceof Error) {
            log?.error(ctx.context.returned);
          }
        }),
      },
    ],
  },
} satisfies BetterAuthPlugin;
