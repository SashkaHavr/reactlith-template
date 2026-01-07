import { createFileRoute } from "@tanstack/react-router";

import { trpcHandler } from "@reactlith-template/trpc";

export const Route = createFileRoute("/trpc/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return await trpcHandler({ request });
      },
      POST: async ({ request }) => {
        return await trpcHandler({ request });
      },
    },
  },
});
