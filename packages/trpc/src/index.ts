import { unstable_localLink } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Result } from "better-result";
import { sql } from "drizzle-orm";
import superjson from "superjson";
import z from "zod";

import { createContext } from "#/context";
import type { ContextParam } from "#/context";
import { createCallerFactory, publicProcedure, router } from "#/init";
import { configRouter } from "#/routers/config";
import { numbersRouter } from "#/routers/numbers";
const appRouter = router({
  health: publicProcedure.output(z.null()).query(async ({ ctx }) => {
    const res = await Result.tryPromise(async () => await ctx.db.execute(sql`select 1`));
    if (res.isErr()) {
      throw new TRPCError({
        message: "Healthcheck: DB connection failed",
        code: "INTERNAL_SERVER_ERROR",
        cause: res.error,
      });
    }
    return null;
  }),
  config: configRouter,
  numbers: numbersRouter,
});

export async function trpcHandler(context: ContextParam) {
  return await fetchRequestHandler({
    req: context.request,
    router: appRouter,
    endpoint: "/trpc",
    createContext: (opts) => createContext({ request: opts.req, context: context.context }),
  });
}

const trpcCallerFactory = createCallerFactory(appRouter);
export function createTrpcCaller(context: ContextParam) {
  return trpcCallerFactory(createContext(context));
}

export function createLocalLink(context: ContextParam) {
  return unstable_localLink({
    router: appRouter,
    // oxlint-disable-next-line require-await
    createContext: async () => {
      return createContext(context);
    },
    transformer: superjson,
  });
}

export type TRPCRouter = typeof appRouter;
export type TRPCInput = inferRouterInputs<TRPCRouter>;
export type TRPCOutput = inferRouterOutputs<TRPCRouter>;
