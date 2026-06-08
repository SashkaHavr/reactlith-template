import { createFileRoute } from "@tanstack/react-router";

import { trpcHandler } from "@reactlith-template/trpc";

export const Route = createFileRoute("/(api)/trpc/$")({
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        return await trpcHandler({ request, context });
      },
      POST: async ({ request, context }) => {
        return await trpcHandler({ request, context });
      },
    },
  },
});
