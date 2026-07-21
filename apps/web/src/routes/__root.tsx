import fontHeadingHref from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url";
import fontSansHref from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { setIdentity, clearIdentity } from "evlog/client";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { getLocale } from "@reactlith-template/intl/runtime";
import { cn } from "@reactlith-template/utils/cn";
import { seo } from "@reactlith-template/utils/seo";
import { getTheme } from "~/components/theme/context";
import { ThemeProvider, ThemeScript } from "~/components/theme/provider";
import { getSessionQueryOptions } from "~/lib/auth";
import { getServerLogger } from "~/lib/log";
import type { createQueryClient } from "~/lib/query";
import { api } from "~/lib/query";

import indexCss from "../index.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: ReturnType<typeof createQueryClient>;
}>()({
  beforeLoad: async ({ context: { queryClient } }) => {
    const [config, auth] = await Promise.all([
      queryClient.ensureQueryData(api.indexRoute.configGeneral.queryOptions()),
      queryClient.ensureQueryData(getSessionQueryOptions),
    ]);

    if (auth.loggedIn) {
      getServerLogger()?.identifyUser(auth);
    }

    const locale = getLocale();

    return {
      auth,
      config,
      locale,
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
    <html
      key={locale}
      lang={locale}
      suppressHydrationWarning
      className={cn(theme !== "system" && theme)}
    >
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
