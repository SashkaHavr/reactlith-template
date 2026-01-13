import z from "zod";

import type { Permissions } from "@reactlith-template/auth";

import { protectedProcedure, publicProcedure, router } from "#init.ts";
import { auth } from "@reactlith-template/auth";

export const authRouter = router({
  getSession: publicProcedure.query(async ({ ctx }) => {
    const res = await auth.api.getSession({ headers: ctx.request.headers });
    return res
      ? {
          loggedIn: true as const,
          session: res.session,
          user: res.user,
        }
      : {
          loggedIn: false as const,
        };
  }),
  userHasPermission: protectedProcedure
    .input(z.object({ permissions: z.object().transform((o) => o as unknown as Permissions) }))
    .query(async ({ ctx, input }) => {
      const res = await auth.api.userHasPermission({
        headers: ctx.request.headers,
        body: {
          permissions: input.permissions,
        },
      });
      return res.success;
    }),
});
