import { TRPCError } from "@trpc/server";

import { publicProcedure } from "#/init";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import { identifyUser } from "@reactlith-template/utils/log";

import { callInUserContext } from "../async-context/user";

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
  const userId = session.user.id as IdBranded<"user">;

  return await callInUserContext(
    { session, userId },
    async () =>
      await next({
        ctx: {
          session,
          userId,
        },
      }),
  );
});
