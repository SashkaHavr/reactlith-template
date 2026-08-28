import { initTRPC } from "@trpc/server";
import { isTaggedError } from "better-result";

import { callInAppContext } from "./async-context/app";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
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
    package: "rpc",
  });

  const result = await callInAppContext(
    ctx,
    async () =>
      await next({
        ctx: {
          db: {},
        },
      }),
  );

  return result;
});

export const createCallerFactory = t.createCallerFactory;
