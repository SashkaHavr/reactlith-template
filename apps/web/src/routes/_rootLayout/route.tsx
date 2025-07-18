import { createFileRoute } from '@tanstack/react-router';

import { getAuthContext } from '~/lib/auth';

export const Route = createFileRoute('/_rootLayout')({
  component: RouteComponent,
  beforeLoad: async ({ context: { queryClient } }) => {
    return {
      auth: await getAuthContext(queryClient),
    };
  },
});

function RouteComponent() {
  return <div>Hello "/_rootLayout"!</div>;
}
