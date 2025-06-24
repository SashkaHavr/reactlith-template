import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  Navigate,
  Outlet,
} from '@tanstack/react-router';
import { IntlProvider } from 'use-intl';
import z from 'zod/v4';

import {
  getMessages,
  getTranslator,
  getZodLocale,
} from '@reactlith-template/locale';

import { useLocaleStore } from '~/components/locale/use-locale-store';
import { getAuthData } from '~/lib/auth';
import { formats, getLocale, useLocaleSync } from '~/lib/intl';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: () => <Navigate to="/" />,
  beforeLoad: async ({ context: { queryClient } }) => {
    const locale = getLocale(useLocaleStore.getState().locale);
    const messages = await getMessages(locale);
    const t = getTranslator({ locale, messages });
    z.config((await getZodLocale(locale))());

    return {
      auth: await getAuthData(queryClient),
      intl: {
        locale,
        messages,
      },
      t: t,
    };
  },
});

declare module 'use-intl' {
  interface AppConfig {
    Formats: typeof formats;
  }
}

function RootComponent() {
  const { intl } = Route.useRouteContext();
  useLocaleSync();
  return (
    <IntlProvider
      messages={intl.messages}
      locale={intl.locale}
      timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
      formats={formats}
    >
      <Outlet />
    </IntlProvider>
  );
}
