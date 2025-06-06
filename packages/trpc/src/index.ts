import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { envServer } from '@reactlith-template/env/server';

import { createContext } from '#context.ts';
import { publicProcedure, router } from '#init.ts';
import { configRouter } from '#routers/config.ts';
import { numbersRouter } from '#routers/numbers.ts';

const appRouter = router({
  health: publicProcedure.query(() => 'Healthy'),
  numbers: numbersRouter,
  config: configRouter,
});

export function trpcHandler({ request }: { request: Request }) {
  return fetchRequestHandler({
    req: request,
    router: appRouter,
    endpoint: '/trpc',
    createContext: (opts) => createContext({ opts }),
  });
}

export type TRPCRouter = typeof appRouter;
export type TRPCInput = inferRouterInputs<TRPCRouter>;
export type TRPCOutput = inferRouterOutputs<TRPCRouter>;
