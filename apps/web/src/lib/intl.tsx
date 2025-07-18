import type { Formats } from 'use-intl';
import { useEffect } from 'react';
import { IntlProvider as BaseIntlProvider } from 'use-intl';

import { useLocaleRouteContext } from './route-context-hooks';

function useIntlSync() {
  const {
    intl: { locale },
  } = useLocaleRouteContext();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
}

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const { intl } = useLocaleRouteContext();
  useIntlSync();
  return (
    <BaseIntlProvider
      messages={intl.messages}
      locale={intl.locale}
      timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
      formats={formats}
    >
      {children}
    </BaseIntlProvider>
  );
}

const formats = {
  dateTime: {
    full: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    },
  },
} satisfies Formats;

declare module 'use-intl' {
  interface AppConfig {
    Formats: typeof formats;
  }
}
