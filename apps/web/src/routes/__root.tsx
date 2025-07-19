/// <reference types="vite/client" />

import type { ReactNode } from 'react';
import {
  createRootRouteWithContext,
  HeadContent,
  isMatch,
  Outlet,
  Scripts,
  useRouterState,
} from '@tanstack/react-router';

import { defaultLocale } from '@reactlith-template/intl';

import type { TRPCRouteContext } from '~/lib/trpc';
import themeDehydrationScript from '~/components/theme/theme-dehydration-script.js?raw';
import indexCss from '../index.css?url';

export const Route = createRootRouteWithContext<TRPCRouteContext>()({
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
    scripts: [{ children: themeDehydrationScript }],
  }),
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const matches = useRouterState({ select: (s) => s.matches }).filter((m) =>
    isMatch(m, 'context.intl.locale'),
  );
  const locale = matches[0]?.context.intl.locale ?? defaultLocale;

  return (
    <html suppressHydrationWarning lang={locale}>
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
