import type { Formats } from 'use-intl';
import { IntlProvider as BaseIntlProvider } from 'use-intl';

import { useRootRouteContext } from './route-context-hooks';

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const { intl } = useRootRouteContext();
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
