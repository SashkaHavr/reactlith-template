import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(api)/api/$")({
  server: {
    handlers: {
      ANY: async ({ request, context }) => context.apiHandler(request),
    },
  },
});
