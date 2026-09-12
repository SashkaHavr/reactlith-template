import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      ANY: async ({ request, context }) => {
        return await context.apiHandler(request);
      },
    },
  },
});
