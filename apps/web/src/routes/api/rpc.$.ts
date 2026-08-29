import { createFileRoute } from "@tanstack/react-router";
import { Context } from "effect";

import { RpcLogger } from "@reactlith-template/rpc/layer";

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      ANY: async ({ request, context }) => {
        return await context.rpcHandler(request, Context.make(RpcLogger, context.log));
      },
    },
  },
});
