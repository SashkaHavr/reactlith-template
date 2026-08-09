import { TRPCError } from "#/context";
import { router } from "#/init";
import { protectedProcedure } from "#/procedures/protected-procedure";
import { userRepo } from "#/routers/users/repo";

import { MaxCountReached } from "./errors";
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
      const result = await numberRepo.getById(input.id);
      if (result.isErr()) {
        throw result.error.match({
          NumberNotFound: (error) => new TRPCError({ code: "NOT_FOUND", error }),
        });
      }

      return result.value;
    }),
  addNew: protectedProcedure
    .input(addNewInput)
    .output(addNewOutput)
    .mutation(async ({ ctx, input }) => {
      return await ctx.transaction(async () => {
        const userLock = await userRepo.getUserLock();
        if (userLock.isErr()) {
          throw userLock.error.match({
            UserNotFound: (error) => new TRPCError({ code: "NOT_FOUND", error }),
          });
        }

        if ((await numberRepo.getCount()) >= 10) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            error: new MaxCountReached({ maxCount: 10 }),
          });
        }

        return await numberRepo.addNew(input.number);
      });
    }),
  update: protectedProcedure
    .input(updateInput)
    .output(updateOutput)
    .mutation(async ({ input }) => {
      const result = await numberRepo.update(input.id, input.data);
      if (result.isErr()) {
        throw result.error.match({
          NumberNotFound: (error) => new TRPCError({ code: "NOT_FOUND", error }),
        });
      }

      return result.value;
    }),
  delete: protectedProcedure
    .input(deleteInput)
    .output(deleteOutput)
    .mutation(async ({ input }) => {
      const result = await numberRepo.deleteById(input.id);
      if (result.isErr()) {
        throw result.error.match({
          NumberNotFound: (error) => new TRPCError({ code: "NOT_FOUND", error }),
        });
      }

      return result.value;
    }),
  deleteAll: protectedProcedure.output(deleteAllOutput).mutation(async () => {
    await numberRepo.deleteAll();
  }),
});
