import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";

import { router } from "#init.ts";
import { protectedProcedure } from "#procedures/protected-procedure.ts";
import { number as numberTable } from "@reactlith-template/db/schema";

export const numbersRouter = router({
  getAll: protectedProcedure
    .output(z.object({ numbers: z.array(z.number()) }))
    .query(async ({ ctx }) => {
      const numbers = await ctx.db.query.number.findMany({
        where: { userId: ctx.userId },
      });
      return { numbers: numbers.map((n) => n.number) };
    }),
  addNew: protectedProcedure.output(z.undefined()).mutation(async ({ ctx }) => {
    const numbers = await ctx.db.query.number.findMany({
      where: { userId: ctx.userId },
    });
    if (numbers.length >= 10) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Max numbers count is 10",
      });
    }

    await ctx.db
      .insert(numberTable)
      .values({ userId: ctx.userId, number: Math.floor(Math.random() * 100) });
  }),
  deleteAll: protectedProcedure.output(z.undefined()).mutation(async ({ ctx }) => {
    await ctx.db.delete(numberTable).where(eq(numberTable.userId, ctx.userId));
  }),
});
