import { createFileRoute } from "@tanstack/react-router";
import { Context } from "effect";

import { ApiLogger } from "@reactlith-template/rpc/layer";

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      ANY: async ({ request, context }) => {
        return await context.apiHandler(request, Context.make(ApiLogger, context.log));
      },
    },
  },
});
