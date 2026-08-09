import { initTRPC } from "@trpc/server";
import { isTaggedError } from "better-result";
import * as z from "zod";

import { callInAppContext } from "./async-context/app";
import { callInTransactionContext } from "./async-context/transaction";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof z.ZodError ? z.flattenError(error.cause) : null,
        resultError: isTaggedError(error.cause) ? error.cause.toJSON() : null,
      },
    };
  },
});

export const router = t.router;

export const publicProcedure = t.procedure.use(async ({ next, path, type, ctx }) => {
  ctx.log?.set({
    trpc: {
      type: type,
      path: path,
    },
    package: "trpc",
  });

  const result = await callInAppContext(
    ctx,
    async () =>
      await next({
        ctx: {
          db: {},
          transaction: async <T>(fn: () => T) =>
            ctx.db.transaction(async (tx) => {
              return await callInTransactionContext<T>({ tx }, fn);
            }),
        },
      }),
  );

  return result;
});

export const createCallerFactory = t.createCallerFactory;
