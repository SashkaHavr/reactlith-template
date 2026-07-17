import fontHeadingHref from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url";
import fontSansHref from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry";
import { setIdentity, clearIdentity } from "evlog/client";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { getTheme } from "~/components/theme/context";
import { ThemeProvider, ThemeScript } from "~/components/theme/provider";
import { preloadAtom } from "~/lib/atom";
import { sessionAtom } from "~/lib/auth";
import { getLocale, getMessages } from "~/lib/intl";
import { IntlProvider } from "~/lib/intl-provider";
import { getServerLogger } from "~/lib/log";
import { cn } from "~/lib/utils";
import { configGeneralAtom } from "~/queries";
import { seo } from "~/utils/seo";

import indexCss from "../index.css?url";

export const Route = createRootRouteWithContext<{
  atomRegistry: AtomRegistry.AtomRegistry;
}>()({
  beforeLoad: async ({ context: { atomRegistry } }) => {
    const locale = await getLocale();
    const [config, auth] = await Promise.all([
      preloadAtom(atomRegistry, configGeneralAtom),
      preloadAtom(atomRegistry, sessionAtom),
    ]);

    if (auth.loggedIn) {
      getServerLogger()?.identifyUser(auth);
    }

    return {
      auth,
      config,
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
  const { locale, theme, auth } = Route.useRouteContext({
    select: (s) => ({ locale: s.intl.locale, theme: s.theme, auth: s.auth }),
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
          <IntlProvider>
            <div className="isolate">{children}</div>
          </IntlProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
