import { unstable_localLink } from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import superjson from "superjson";

import { createContext } from "#/context";
import type { ContextParam } from "#/context";
import { createCallerFactory, router } from "#/init";
import { configRouter } from "#/routers/config/router";
import { numbersRouter } from "#/routers/numbers/router";

const appRouter = router({
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
