import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

import { db } from '@reactlith-template/db';
import { number as numberTable } from '@reactlith-template/db/schema';

import { protectedProcedure, router } from '#init.ts';

export const numbersRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const numbers = await db.query.number.findMany({
      where: { userId: ctx.userId },
    });
    return numbers.map((n) => n.number);
  }),
  addNew: protectedProcedure.mutation(async ({ ctx }) => {
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
  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    await db.delete(numberTable).where(eq(numberTable.userId, ctx.userId));
  }),
});
