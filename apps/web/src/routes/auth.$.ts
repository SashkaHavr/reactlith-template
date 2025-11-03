import { createFileRoute } from '@tanstack/react-router';

import { auth } from '@reactlith-template/auth';

export const Route = createFileRoute('/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return auth.handler(request);
      },
      POST: async ({ request }) => {
        return auth.handler(request);
      },
    },
  },
});
