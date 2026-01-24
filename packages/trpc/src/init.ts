import { initTRPC, TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import superjson from "superjson";
import z, { ZodError } from "zod";

import type { Context } from "#context.ts";
import type { Permissions } from "@reactlith-template/auth";

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

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = await ctx.auth.getSession({
    headers: ctx.request.headers,
  });
  if (!session) {
    throw new TRPCError({
      message: "You must authenticate to use this endpoint",
      code: "UNAUTHORIZED",
    });
  }

  ctx.logger.setBindings({
    user: {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role ?? undefined,
    },
  });

  return await next({
    ctx: {
      session: session,
      userId: session.user.id,
    },
  });
});

export function adminProcedure(permissions: Permissions) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const requestPermissionsList = (
      Object.entries(permissions) as [
        keyof typeof permissions,
        NonNullable<(typeof permissions)[keyof typeof permissions]>,
      ][]
    )
      .flatMap(([key, value]) =>
        value.map((p): `${keyof typeof permissions}.${typeof p}` => `${key}.${p}`),
      )
      .flat();

    ctx.logger.setBindings({
      adminProcedure: {
        permissionsRequested: requestPermissionsList,
      },
    });

    if (requestPermissionsList.length === 0) {
      throw new TRPCError({
        message: "No permissions specified for adminProcedure",
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    const hasPermission = await ctx.auth.userHasPermission({
      body: { userId: ctx.userId, permissions: permissions },
    });
    if (!hasPermission.success) {
      throw new TRPCError({
        message: "You don't have permissions to access this endpoint",
        code: "FORBIDDEN",
      });
    }

    return await next();
  });
}

export const createCallerFactory = t.createCallerFactory;
