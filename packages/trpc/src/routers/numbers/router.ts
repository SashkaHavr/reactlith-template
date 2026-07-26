import z from "zod";

import { callInTransactionContext } from "#/async-context/transaction";
import { router } from "#/init";
import { protectedProcedure } from "#/procedures/protected-procedure";
import { userRepo } from "#/routers/users/repo";
import { idBranded } from "@reactlith-template/db/id-branded";

import { numberErrors } from "./errors";
import { numberRepo } from "./repo";
import { numberInput, numberOutput, numberUpdateInput } from "./schema";

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
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        return await callInTransactionContext({ tx }, async () => {
          await userRepo.getUserLock();

          if ((await numberRepo.getCount()) >= 10) {
            throw numberErrors.MAX_COUNT_REACHED();
          }

          return await numberRepo.addNew(input.number);
        });
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: idBranded("number"),
        data: numberUpdateInput,
      }),
    )
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
