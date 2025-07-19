/// <reference types="vite/client" />

import type { ReactNode } from 'react';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';

import type { TRPCRouteContext } from '~/lib/trpc';
import { getAuthContext } from '~/lib/auth';
import indexCss from '../index.css?url';

export const Route = createRootRouteWithContext<TRPCRouteContext>()({
  beforeLoad: async ({ context: { queryClient } }) => {
    return { auth: await getAuthContext(queryClient) };
  },
  component: RootComponent,
  notFoundComponent: () => <p>Page not found</p>,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Reactlith template',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [
      { rel: 'stylesheet', href: indexCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
});

function RootComponent() {
  const { auth } = Route.useRouteContext();
  console.log(auth.isLoggedIn);
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
