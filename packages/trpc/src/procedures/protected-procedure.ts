import { TRPCError } from "@trpc/server";

import { publicProcedure } from "#init.ts";

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

  ctx.logger.setBindings({
    user: {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role ?? undefined,
    },
  });

  return await next({
    ctx: {
      session: session,
      userId: session.user.id,
    },
  });
});
