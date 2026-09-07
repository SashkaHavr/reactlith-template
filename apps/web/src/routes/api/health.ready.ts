import { createFileRoute } from "@tanstack/react-router";

import { healthcheckDB } from "@reactlith-template/db";

export const Route = createFileRoute("/api/health/ready")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        try {
          await healthcheckDB(context.db);
          return new Response(undefined, { status: 204 });
        } catch {
          return new Response(undefined, { status: 503 });
        }
      },
    },
  },
});
