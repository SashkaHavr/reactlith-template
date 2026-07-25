import { TRPCError } from "@trpc/server";
import z from "zod";

import { router } from "#/init";
import { protectedProcedure } from "#/procedures/protected-procedure";
import { numberRepo } from "#/repositories/number-repo";
import { idBranded } from "@reactlith-template/db/id-branded";

const numberInput = z.object({ number: z.int() });
const numberIdInput = z.object({ id: idBranded("number") });
const numberOutput = z.object({ id: idBranded("number"), number: z.int() });

export const numbersRouter = router({
  getAll: protectedProcedure
    .output(z.object({ numbers: z.array(numberOutput) }))
    .query(async () => {
      return { numbers: await numberRepo.getAll() };
    }),
  getById: protectedProcedure
    .input(numberIdInput)
    .output(numberOutput)
    .query(async ({ input }) => {
      return await numberRepo.getById(input.id);
    }),
  addNew: protectedProcedure
    .input(numberInput)
    .output(numberOutput)
    .mutation(async ({ input }) => {
      if ((await numberRepo.getCount()) >= 10) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Max numbers count is 10",
        });
      }

      return await numberRepo.addNew(input.number);
    }),
  update: protectedProcedure
    .input(numberIdInput.extend(numberInput.shape))
    .output(numberOutput)
    .mutation(async ({ input }) => {
      return await numberRepo.update(input.id, input.number);
    }),
  delete: protectedProcedure
    .input(numberIdInput)
    .output(numberIdInput)
    .mutation(async ({ input }) => {
      return await numberRepo.deleteById(input.id);
    }),
  deleteAll: protectedProcedure.output(z.undefined()).mutation(async () => {
    await numberRepo.deleteAll();
  }),
});
