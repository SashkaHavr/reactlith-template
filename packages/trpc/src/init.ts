import { initTRPC } from "@trpc/server";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server";
import superjson from "superjson";
import z, { ZodError } from "zod";

import { callInAppContext } from "./async-context/app";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? z.prettifyError(error.cause) : null,
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
    ctx.log?.set({
      trpc: {
        errorCode: result.error.code,
      },
    });
    ctx.log?.error(result.error);
  }

  return result;
});

export const createCallerFactory = t.createCallerFactory;

declare module "evlog" {
  interface ErrorCatalogEntry {
    trpcCode: TRPC_ERROR_CODE_KEY;
  }
}
