import { initTRPC, TRPCError } from "@trpc/server";
import { getStatusKeyFromCode } from "@trpc/server/unstable-core-do-not-import";
import { EvlogError } from "evlog";
import z, { ZodError } from "zod";

import { callInAppContext } from "./async-context/app";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? z.prettifyError(error.cause) : null,
        evlogError: error.cause instanceof EvlogError ? error.cause.toJSON() : null,
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

  const result = await callInAppContext(ctx, async () => await next());

  if (!result.ok) {
    const evlogError = result.error.cause;
    if (evlogError instanceof EvlogError) {
      ctx.log?.error(evlogError);
      throw new TRPCError({
        code: getStatusKeyFromCode(evlogError.status),
        message: evlogError.message,
        cause: evlogError,
      });
    }
    ctx.log?.error(result.error);
  }

  return result;
});

export const createCallerFactory = t.createCallerFactory;
