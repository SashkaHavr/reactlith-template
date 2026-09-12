/// <reference types="vite/client" />

import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { setIdentity, clearIdentity } from "evlog/client";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { getLocale } from "@reactlith-template/intl/runtime";
import { getTheme, getThemeCookie, ThemeScript } from "~/components/theme";
import { AnchoredToastProvider, ToastProvider } from "~/components/ui/toast";
import { getSessionQueryOptions } from "~/lib/auth";
import type { RouterContext } from "~/lib/context";
import { authConfigQueryOptions } from "~/queries/config";
import { getServerLog } from "~/utils/log";

import indexCss from "../index.css?url";

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context: { queryClient } }) => {
    const locale = getLocale();
    const [authConfig, session] = await Promise.all([
      queryClient.query({ ...authConfigQueryOptions, staleTime: "static" }),
      queryClient.query({ ...getSessionQueryOptions, staleTime: "static" }),
    ]);

    if (session.loggedIn) {
      getServerLog()?.set({ user: { id: session.user.id, role: session.user.role } });
    }

    return {
      session,
      authConfig,
      locale: locale,
      theme: { theme: await getTheme(), themeCookieExists: (await getThemeCookie()) !== undefined },
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
      { name: "robots", content: "noindex, nofollow" },
      { title: "reactlith-template" },
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

function useSetLogIdentity() {
  const session = Route.useRouteContext({
    select: (s) => s.session,
  });

  useEffect(() => {
    if (session.loggedIn) {
      setIdentity({ user: { id: session.user.id, role: session.user.role } });
    } else {
      clearIdentity();
    }
  }, [session]);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { locale, theme } = Route.useRouteContext({
    select: (s) => ({ locale: s.locale, theme: s.theme.theme }),
  });

  useSetLogIdentity();

  return (
    <html suppressHydrationWarning lang={locale} className={theme}>
      <head>
        <HeadContent />
        <ThemeScript />
      </head>
      <body>
        <ToastProvider>
          <AnchoredToastProvider>
            <div className="isolate">{children}</div>
          </AnchoredToastProvider>
        </ToastProvider>
        <Scripts />
      </body>
    </html>
  );
}
