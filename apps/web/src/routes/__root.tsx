/// <reference types="vite/client" />

import fontHeadingHref from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url";
import fontSansHref from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { setIdentity, clearIdentity } from "evlog/client";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { getLocale } from "@reactlith-template/intl/runtime";
import { identifyUser } from "@reactlith-template/utils/log";
import { seo } from "@reactlith-template/utils/seo";
import { getTheme } from "~/components/theme/context";
import { ThemeScript, ThemeProvider } from "~/components/theme/provider";
import { AnchoredToastProvider, ToastProvider } from "~/components/ui/toast";
import { getSessionQueryOptions } from "~/lib/auth";
import type { TRPCRouteContext } from "~/lib/trpc";
import { cn } from "~/lib/utils";
import { getServerLog } from "~/utils/log";

import indexCss from "../index.css?url";

export const Route = createRootRouteWithContext<TRPCRouteContext>()({
  beforeLoad: async ({ context: { queryClient, trpc } }) => {
    const locale = getLocale();
    const [config, auth] = await Promise.all([
      queryClient.ensureQueryData(trpc.config.auth.queryOptions()),
      queryClient.ensureQueryData(getSessionQueryOptions),
    ]);

    if (auth.loggedIn) {
      identifyUser(getServerLog(), auth);
    }

    return {
      auth,
      config,
      locale: locale,
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
  const { locale, theme, auth } = Route.useRouteContext({
    select: (s) => ({ locale: s.locale, theme: s.theme, auth: s.auth }),
  });

  useEffect(() => {
    if (auth.loggedIn) {
      setIdentity({ user: { id: auth.user.id, role: auth.user.role } });
    } else {
      clearIdentity();
    }
  }, [auth]);

  return (
    <html suppressHydrationWarning lang={locale} className={cn(theme !== "system" && theme)}>
      <head>
        <HeadContent />
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <AnchoredToastProvider>
              <div className="isolate">{children}</div>
            </AnchoredToastProvider>
          </ToastProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
