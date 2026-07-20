import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { ErrorComponent } from "./components/router-default/error-component";
import { NotFoundComponent } from "./components/router-default/not-found-component";
import { PendingComponent } from "./components/router-default/pending-component";
import { setupClientLog } from "./lib/log";
import { createQueryClient } from "./lib/query";
import { routeTree } from "./routeTree.gen";

setupClientLog();

export function getRouter() {
  const queryClient = createQueryClient();

  const router = createRouter({
    context: { queryClient },
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPreload: "intent",
    defaultPendingComponent: PendingComponent,
    defaultNotFoundComponent: NotFoundComponent,
    defaultErrorComponent: ErrorComponent,
    Wrap: (props) => {
      return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
    },
  });

  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}
