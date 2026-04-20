import { TRPCError } from "@trpc/server";

import { publicProcedure } from "#init.ts";
import { identifyUser } from "@reactlith-template/utils/logger";

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = await ctx.auth.getSession({
    headers: ctx.request.headers,
  });
  if (!session) {
    throw new TRPCError({
      message: "You must authenticate to use this endpoint",
      code: "UNAUTHORIZED",
    });
  }

  identifyUser(ctx.log, session);

  return await next({
    ctx: {
      session: session,
      userId: session.user.id,
    },
  });
});
