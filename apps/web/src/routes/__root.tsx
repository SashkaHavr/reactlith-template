/// <reference types="vite/client" />

import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { setIdentity, clearIdentity } from "evlog/client";
import { useEffect } from "react";
import type { ReactNode } from "react";
import * as z from "zod";

import { getLocale } from "@reactlith-template/intl/runtime";
import type { Locale } from "@reactlith-template/intl/runtime";
import { identifyUser } from "@reactlith-template/utils/log";
import { seo } from "@reactlith-template/utils/seo";
import { getTheme } from "~/components/theme/context";
import { ThemeScript, ThemeProvider } from "~/components/theme/provider";
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
  const auth = Route.useRouteContext({
    select: (s) => s.auth,
  });

  useEffect(() => {
    if (auth.loggedIn) {
      setIdentity({ user: { id: auth.user.id, role: auth.user.role } });
    } else {
      clearIdentity();
    }
  }, [auth]);
}

const loadByLocale: Record<Locale, () => Promise<void>> = {
  en: async () => {
    z.config((await import("zod/v4/locales/en.js")).default());
  },
};

function useSetupZodLocale() {
  const locale = Route.useRouteContext({
    select: (s) => s.locale,
  });

  useEffect(() => {
    void loadByLocale[locale]();
  }, [locale]);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { locale, theme } = Route.useRouteContext({
    select: (s) => ({ locale: s.locale, theme: s.theme, auth: s.auth }),
  });

  useSetLogIdentity();
  useSetupZodLocale();

  return (
    <html suppressHydrationWarning lang={locale} className={cn(theme !== "system" && theme)}>
      <head>
        <HeadContent />
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <div className="isolate">{children}</div>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
