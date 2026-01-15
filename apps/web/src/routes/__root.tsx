/// <reference types="vite/client" />

import type { ReactNode } from "react";

import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

import type { TRPCRouteContext } from "~/lib/trpc";

import { getTheme } from "~/components/theme/context";
import { ThemeProvider, ThemeScript } from "~/components/theme/provider";
import { getSessionQueryOptions } from "~/lib/auth";
import { getLocale, getMessages } from "~/lib/intl";
import { IntlProvider } from "~/lib/intl-provider";
import { cn } from "~/lib/utils";
import { seo } from "~/utils/seo";

import indexCss from "../index.css?url";

export const Route = createRootRouteWithContext<TRPCRouteContext>()({
  beforeLoad: async ({ context: { queryClient, trpc } }) => {
    const locale = getLocale();
    const data = await Promise.all([
      queryClient.ensureQueryData(trpc.config.general.queryOptions()),
      queryClient.ensureQueryData(getSessionQueryOptions),
    ]);

    return {
      auth: data[1],
      intl: {
        messages: await getMessages(locale),
        locale: locale,
      },
      theme: getTheme(),
    };
  },
  component: RootComponent,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { name: "theme-color" },
      ...seo({ title: "reactlith-template" }),
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      { rel: "stylesheet", href: indexCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
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
  const { locale, theme } = Route.useRouteContext({
    select: (s) => ({ locale: s.intl.locale, theme: s.theme }),
  });

  return (
    <html suppressHydrationWarning lang={locale} className={cn(theme !== "system" && theme)}>
      <head>
        <HeadContent />
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <IntlProvider>
            <div className="isolate">{children}</div>
          </IntlProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
