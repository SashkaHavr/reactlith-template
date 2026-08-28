import { createFileRoute } from "@tanstack/react-router";

import { trpcHandler } from "@reactlith-template/rpc";

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      ANY: async ({ request, context }) => {
        return await trpcHandler({ request, context });
      },
    },
  },
});
