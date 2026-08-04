import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { deLocalizeUrl, localizeUrl } from "@reactlith-template/intl/runtime";
import { setupClientLog } from "~/utils/log";

import { ErrorComponent } from "./components/router-default/error-component";
import { NotFoundComponent } from "./components/router-default/not-found-component";
import { PendingComponent } from "./components/router-default/pending-component";
import { createTRPCRouteContext, TRPCProvider } from "./lib/trpc";
import { routeTree } from "./routeTree.gen";

setupClientLog();

export function getRouter() {
  const trpcRouteContext = createTRPCRouteContext();

  const router = createRouter({
    context: { ...trpcRouteContext },
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
    Wrap: (props) => {
      return (
        <TRPCProvider
          trpcClient={trpcRouteContext.trpcClient}
          queryClient={trpcRouteContext.queryClient}
        >
          {props.children}
        </TRPCProvider>
      );
    },
  });

  setupRouterSsrQueryIntegration({
    router: router,
    queryClient: trpcRouteContext.queryClient,
  });

  return router;
}
