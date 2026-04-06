/// <reference types="vite/client" />

import fontHeadingHref from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url";
import fontSansHref from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import type { ReactNode } from "react";

import { envNode } from "@reactlith-template/env/node";
import { getTheme } from "~/components/theme/context";
import { ThemeProvider, ThemeScript } from "~/components/theme/provider";
import { getSessionQueryOptions } from "~/lib/auth";
import { getLocale, getMessages } from "~/lib/intl";
import { IntlProvider } from "~/lib/intl-provider";
import type { TRPCRouteContext } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { seo } from "~/utils/seo";

import indexCss from "../index.css?url";

const envRunHealthcheck = createIsomorphicFn()
  .server(() => envNode.HEALTHCHECK_ON_SSR)
  .client(() => false);

export const Route = createRootRouteWithContext<TRPCRouteContext>()({
  beforeLoad: async ({ context: { queryClient, trpc } }) => {
    if (envRunHealthcheck()) {
      await queryClient.ensureQueryData(
        trpc.health.queryOptions(void 0, {
          staleTime: "static",
          gcTime: Infinity,
          retry: 20,
          retryDelay: 500,
        }),
      );
    }

    const locale = await getLocale();
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
      theme: await getTheme(),
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
      {
        rel: "preload",
        href: fontSansHref,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: fontHeadingHref,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
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
