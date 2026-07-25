import z from "zod";

import { router } from "#/init";
import { protectedProcedure } from "#/procedures/protected-procedure";
import { idBranded } from "@reactlith-template/db/id-branded";

import { numberErrors } from "./errors";
import { numberRepo } from "./repo";
import { numberInput, numberOutput } from "./schema";

export const numbersRouter = router({
  getAll: protectedProcedure
    .output(z.object({ numbers: z.array(numberOutput) }))
    .query(async () => {
      return { numbers: await numberRepo.getAll() };
    }),
  getById: protectedProcedure
    .input(z.object({ id: idBranded("number") }))
    .output(numberOutput)
    .query(async ({ input }) => {
      return await numberRepo.getById(input.id);
    }),
  addNew: protectedProcedure
    .input(numberInput)
    .output(numberOutput)
    .mutation(async ({ input }) => {
      if ((await numberRepo.getCount()) >= 10) {
        throw numberErrors.MAX_COUNT_REACHED();
      }

      return await numberRepo.addNew(input.number);
    }),
  update: protectedProcedure
    .input(z.object({ id: idBranded("number"), data: numberInput.partial() }))
    .output(numberOutput)
    .mutation(async ({ input }) => {
      return await numberRepo.update(input.id, input.data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: idBranded("number") }))
    .output(z.object({ id: idBranded("number") }))
    .mutation(async ({ input }) => {
      return await numberRepo.deleteById(input.id);
    }),
  deleteAll: protectedProcedure.output(z.undefined()).mutation(async () => {
    await numberRepo.deleteAll();
  }),
});
