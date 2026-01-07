import { useRouteContext } from "@tanstack/react-router";
import { IntlProvider as BaseIntlProvider } from "use-intl";

import { intlFormats } from "./intl";

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const intl = useRouteContext({ from: "__root__", select: (s) => s.intl });
  return (
    <BaseIntlProvider
      messages={intl.messages}
      locale={intl.locale}
      timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
      formats={intlFormats}
    >
      {children}
    </BaseIntlProvider>
  );
}
