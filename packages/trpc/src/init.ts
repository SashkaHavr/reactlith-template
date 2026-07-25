import { initTRPC } from "@trpc/server";
import { EvlogError } from "evlog";
import superjson from "superjson";
import z, { ZodError } from "zod";

import { callInAppContext } from "./async-context/app";
import type { Context } from "./context";
import { TRPCEvlogError } from "./error";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
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
      throw new TRPCEvlogError(evlogError);
    }
    ctx.log?.error(result.error);
  }

  return result;
});

export const createCallerFactory = t.createCallerFactory;
