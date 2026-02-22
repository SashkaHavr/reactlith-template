import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createContext } from "#context.ts";
import { createCallerFactory, publicProcedure, router } from "#init.ts";
import { configRouter } from "#routers/config.ts";
import { numbersRouter } from "#routers/numbers.ts";

const appRouter = router({
  health: publicProcedure.query(() => "tRPC healthy!"),
  config: configRouter,
  numbers: numbersRouter,
});

export async function trpcHandler({ request }: { request: Request }) {
  return await fetchRequestHandler({
    req: request,
    router: appRouter,
    endpoint: "/trpc",
    createContext: (opts) => createContext({ request: opts.req }),
  });
}

export const createTrpcCaller = createCallerFactory(appRouter);

export type TRPCRouter = typeof appRouter;
export type TRPCInput = inferRouterInputs<TRPCRouter>;
export type TRPCOutput = inferRouterOutputs<TRPCRouter>;
