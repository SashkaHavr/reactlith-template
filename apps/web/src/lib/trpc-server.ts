import { createTrpcCaller } from "@reactlith-template/trpc";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const trpcServerFnMiddleware = createMiddleware({
  type: "function",
}).server(({ next }) => {
  return next({
    context: {
      trpc: createTrpcCaller({ request: getRequest() }),
    },
  });
});

export const getGeneralConfigServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .handler(({ context: { trpc } }) => {
    return trpc.config.general();
  });

export const getHealthCheckServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .handler(({ context: { trpc } }) => {
    return trpc.health();
  });

export const getNumbersServerFn = createServerFn()
  .middleware([trpcServerFnMiddleware])
  .handler(({ context: { trpc } }) => {
    return trpc.numbers.getAll();
  });
