import { callInTransactionContext } from "#/async-context/transaction";
import { router } from "#/init";
import { protectedProcedure } from "#/procedures/protected-procedure";
import { userRepo } from "#/routers/users/repo";

import { numberErrors } from "./errors";
import { numberRepo } from "./repo";
import {
  addNewInput,
  addNewOutput,
  deleteAllOutput,
  deleteInput,
  deleteOutput,
  getAllOutput,
  getByIdInput,
  getByIdOutput,
  updateInput,
  updateOutput,
} from "./schema";

export const numbersRouter = router({
  getAll: protectedProcedure.output(getAllOutput).query(async () => {
    return { numbers: await numberRepo.getAll() };
  }),
  getById: protectedProcedure
    .input(getByIdInput)
    .output(getByIdOutput)
    .query(async ({ input }) => {
      return await numberRepo.getById(input.id);
    }),
  addNew: protectedProcedure
    .input(addNewInput)
    .output(addNewOutput)
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
    .input(updateInput)
    .output(updateOutput)
    .mutation(async ({ input }) => {
      return await numberRepo.update(input.id, input.data);
    }),
  delete: protectedProcedure
    .input(deleteInput)
    .output(deleteOutput)
    .mutation(async ({ input }) => {
      return await numberRepo.deleteById(input.id);
    }),
  deleteAll: protectedProcedure.output(deleteAllOutput).mutation(async () => {
    await numberRepo.deleteAll();
  }),
});
