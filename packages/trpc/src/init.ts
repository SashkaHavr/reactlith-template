import { initTRPC } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import superjson from "superjson";
import z, { ZodError } from "zod";

import type { Context } from "#context.ts";

import { baseLogger } from "@reactlith-template/utils/logger";

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
  const startTime = Date.now();
  const url = new URL(ctx.request.url);
  const logger = baseLogger.child({
    startTime: startTime,
    service: "trpc",
    request: {
      id: crypto.randomUUID(),
      method: ctx.request.method,
      path: url.pathname,
      query: decodeURIComponent(url.search),
    },
    trpcRequest: {
      type: type,
      path: path,
    },
  });

  const result = await next({ ctx: { logger } });

  const endTime = Date.now();
  logger.setBindings({
    endTime: endTime,
    duration: endTime - startTime,
  });

  if (result.ok) {
    logger.info({
      response: {
        statusCode: 200,
      },
    });
  } else {
    logger.setBindings({
      response: {
        statusCode: getHTTPStatusCodeFromError(result.error),
      },
      trpcResponse: {
        errorCode: result.error.code,
      },
    });
    logger.error(result.error);
  }

  return result;
});

export const createCallerFactory = t.createCallerFactory;
