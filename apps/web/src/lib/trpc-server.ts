import { createTrpcCaller } from "@reactlith-template/trpc";
import { createMiddleware } from "@tanstack/react-start";
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
