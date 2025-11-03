import { TRPCError } from '@trpc/server';
import z from 'zod';

import { db } from '@reactlith-template/db';
import { eq } from '@reactlith-template/db/drizzle';
import { number as numberTable } from '@reactlith-template/db/schema';

import { protectedProcedure, router } from '#init.ts';

export const numbersRouter = router({
  getAll: protectedProcedure
    .output(z.object({ numbers: z.array(z.number()) }))
    .query(async ({ ctx }) => {
      const numbers = await db.query.number.findMany({
        where: { userId: ctx.userId },
      });
      return { numbers: numbers.map((n) => n.number) };
    }),
  addNew: protectedProcedure.output(z.undefined()).mutation(async ({ ctx }) => {
    const numbers = await db.query.number.findMany({
      where: { userId: ctx.userId },
    });
    if (numbers.length >= 10) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Max numbers count is 10',
      });
    }

    await db
      .insert(numberTable)
      .values({ userId: ctx.userId, number: Math.floor(Math.random() * 100) });
  }),
  deleteAll: protectedProcedure
    .output(z.undefined())
    .mutation(async ({ ctx }) => {
      await db.delete(numberTable).where(eq(numberTable.userId, ctx.userId));
    }),
});
