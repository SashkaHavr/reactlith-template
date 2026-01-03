import type { Formats } from "use-intl";

import { useRouteContext } from "@tanstack/react-router";
import { IntlProvider as BaseIntlProvider } from "use-intl";

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const intl = useRouteContext({ from: "__root__", select: (s) => s.intl });
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
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    },
  },
} satisfies Formats;

declare module "use-intl" {
  interface AppConfig {
    Formats: typeof formats;
  }
}
