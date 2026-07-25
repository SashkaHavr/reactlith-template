import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";

import { router } from "#/init";
import { protectedProcedure } from "#/procedures/protected-procedure";
import { schema } from "@reactlith-template/db";

export const numbersRouter = router({
  getAll: protectedProcedure
    .output(z.object({ numbers: z.array(z.number()) }))
    .query(async ({ ctx }) => {
      const numbers = await ctx.db.query.number.findMany({
        where: { userId: { eq: ctx.userId } },
      });
      return { numbers: numbers.map((n) => n.number) };
    }),
  addNew: protectedProcedure.output(z.undefined()).mutation(async ({ ctx }) => {
    const numbers = await ctx.db.query.number.findMany({
      where: { userId: { eq: ctx.userId } },
    });
    if (numbers.length >= 10) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Max numbers count is 10",
      });
    }

    await ctx.db
      .insert(schema.number)
      .values({ userId: ctx.userId, number: Math.floor(Math.random() * 100) });
  }),
  deleteAll: protectedProcedure.output(z.undefined()).mutation(async ({ ctx }) => {
    await ctx.db.delete(schema.number).where(eq(schema.number.userId, ctx.userId));
  }),
});
