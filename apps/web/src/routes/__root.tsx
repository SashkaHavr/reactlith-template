/// <reference types="vite/client" />

import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { setIdentity, clearIdentity } from "evlog/client";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { getLocale } from "@reactlith-template/intl/runtime";
import { getTheme, syncMetaThemeColor, ThemeScript, useSyncTheme } from "~/components/theme";
import { AnchoredToastProvider, ToastProvider } from "~/components/ui/toast";
import { readAtom } from "~/lib/atom";
import { loadSession } from "~/lib/auth";
import type { RouterContext } from "~/lib/context";
import { authConfigAtom } from "~/queries/config";
import { getServerLog } from "~/utils/log";

import indexCss from "../index.css?url";

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context: { registry }, abortController }) => {
    const [authConfig, session] = await Promise.all([
      readAtom(registry, authConfigAtom, abortController.signal),
      loadSession(registry),
    ]);

    if (session.loggedIn) {
      getServerLog()?.set({ user: { id: session.user.id, role: session.user.role } });
    }

    return {
      session,
      authConfig,
      theme: getTheme(),
    };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { name: "robots", content: "noindex, nofollow" },
      { title: "reactlith-template" },
    ],
    links: [
      { rel: "stylesheet", href: indexCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  scripts: () => [{ children: `(${syncMetaThemeColor.toString()})()` }],
  shellComponent: RootShell,
  component: RouteComponent,
});

function RouteComponent() {
  useSetLogIdentity();
  useSyncTheme();

  return (
    <>
      <ToastProvider>
        <AnchoredToastProvider>
          <div className="isolate">
            <Outlet />
          </div>
        </AnchoredToastProvider>
      </ToastProvider>
    </>
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

function RootShell({ children }: Readonly<{ children: ReactNode }>) {
  const theme = Route.useRouteContext({
    select: (s) => s.theme,
  });

  return (
    <html suppressHydrationWarning lang={getLocale()} className={theme}>
      <head>
        <HeadContent />
        <ThemeScript />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
