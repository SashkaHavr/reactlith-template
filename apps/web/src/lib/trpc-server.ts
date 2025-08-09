import { createMiddleware, createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

import { createTrpcCaller } from '@reactlith-template/trpc';

export const trpcServerFnMiddleware = createMiddleware({
  type: 'function',
}).server(({ next }) => {
  return next({
    context: {
      trpc: createTrpcCaller({ request: getWebRequest() }),
    },
  });
});

export const healthServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .handler(({ context: { trpc } }) => {
    return trpc.health();
  });

export const getNumbersServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .handler(({ context: { trpc } }) => {
    return trpc.numbers.getAll();
  });
