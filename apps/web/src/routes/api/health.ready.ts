import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";

export const Route = createFileRoute("/api/health/ready")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        try {
          await Effect.runPromise(context.apiClient.config.healthReady());
          return new Response(undefined, { status: 204 });
        } catch {
          return new Response(undefined, { status: 503 });
        }
      },
    },
  },
});
