import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(api)/auth/$")({
  server: {
    handlers: {
      ANY: async ({ request, context }) => {
        return await context.auth.handler(request);
      },
    },
  },
});
