import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { deLocalizeUrl, localizeUrl } from "@reactlith-template/intl/runtime";
import { setupClientLog } from "~/utils/log";

import { ErrorComponent } from "./components/router-default/error-component";
import { NotFoundComponent } from "./components/router-default/not-found-component";
import { PendingComponent } from "./components/router-default/pending-component";
import { createRouterContext } from "./lib/context";
import { routeTree } from "./routeTree.gen";

setupClientLog();

export function getRouter() {
  const routerContext = createRouterContext();

  const router = createRouter({
    context: { ...routerContext },
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPreload: "intent",
    defaultPendingComponent: PendingComponent,
    defaultNotFoundComponent: NotFoundComponent,
    defaultErrorComponent: ErrorComponent,
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
  });

  setupRouterSsrQueryIntegration({
    router: router,
    queryClient: routerContext.queryClient,
  });

  return router;
}
