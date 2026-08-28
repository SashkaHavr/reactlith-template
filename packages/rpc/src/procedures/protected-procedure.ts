import { TaggedError } from "better-result";

import { callInUserContext } from "#async-context/user";
import { TRPCError } from "#context";
import { publicProcedure } from "#init";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import { identifyUser } from "@reactlith-template/utils/log";

export class ProtectedProcedureUnauthorized extends TaggedError("ProtectedProcedureUnauthorized")<{
  message: string;
}> {
  constructor() {
    super({
      message: "You must authenticate to use this endpoint",
    });
  }
}

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = await ctx.auth.getSession({
    headers: ctx.request.headers,
  });
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", error: new ProtectedProcedureUnauthorized() });
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
