import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { router } from "#/init";
import { protectedProcedure } from "#/procedures/protected-procedure";
import { schema } from "@reactlith-template/db";
import { idBranded } from "@reactlith-template/db/id-branded";

const numberInput = z.object({ number: z.int() });
const numberIdInput = z.object({ id: idBranded("number") });
const numberOutput = z.object({ id: idBranded("number"), number: z.int() });

export const numbersRouter = router({
  getAll: protectedProcedure
    .output(z.object({ numbers: z.array(numberOutput) }))
    .query(async ({ ctx }) => {
      const numbers = await ctx.db.query.number.findMany({
        where: { userId: { eq: ctx.userId } },
        orderBy: { createdAt: "asc" },
      });
      return { numbers: numbers.map(({ id, number }) => ({ id, number })) };
    }),
  getById: protectedProcedure
    .input(numberIdInput)
    .output(numberOutput)
    .query(async ({ ctx, input }) => {
      const number = await ctx.db.query.number.findFirst({
        where: { id: { eq: input.id }, userId: { eq: ctx.userId } },
      });

      if (!number) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Number not found" });
      }

      return { id: number.id, number: number.number };
    }),
  addNew: protectedProcedure
    .input(numberInput)
    .output(numberOutput)
    .mutation(async ({ ctx, input }) => {
      const numbers = await ctx.db.query.number.findMany({
        where: { userId: { eq: ctx.userId } },
      });
      if (numbers.length >= 10) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Max numbers count is 10",
        });
      }

      const [number] = await ctx.db
        .insert(schema.number)
        .values({ userId: ctx.userId, number: input.number })
        .returning({ id: schema.number.id, number: schema.number.number });

      if (!number) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add number" });
      }

      return number;
    }),
  update: protectedProcedure
    .input(numberIdInput.extend(numberInput.shape))
    .output(numberOutput)
    .mutation(async ({ ctx, input }) => {
      const [number] = await ctx.db
        .update(schema.number)
        .set({ number: input.number })
        .where(and(eq(schema.number.id, input.id), eq(schema.number.userId, ctx.userId)))
        .returning({ id: schema.number.id, number: schema.number.number });

      if (!number) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Number not found" });
      }

      return number;
    }),
  delete: protectedProcedure
    .input(numberIdInput)
    .output(numberIdInput)
    .mutation(async ({ ctx, input }) => {
      const [number] = await ctx.db
        .delete(schema.number)
        .where(and(eq(schema.number.id, input.id), eq(schema.number.userId, ctx.userId)))
        .returning({ id: schema.number.id });

      if (!number) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Number not found" });
      }

      return number;
    }),
  deleteAll: protectedProcedure.output(z.undefined()).mutation(async ({ ctx }) => {
    await ctx.db.delete(schema.number).where(eq(schema.number.userId, ctx.userId));
  }),
});
