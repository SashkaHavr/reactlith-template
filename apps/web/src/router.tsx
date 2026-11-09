import { RegistryContext } from "@effect/atom-react";
import { createRouter } from "@tanstack/react-router";
import { Hydration } from "effect/reactivity";

import { deLocalizeUrl, localizeUrl } from "@reactlith-template/intl/runtime";
import { setupClientLog } from "~/utils/log";

import { ErrorComponent } from "./components/router-default/error-component";
import { NotFoundComponent } from "./components/router-default/not-found-component";
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
    defaultNotFoundComponent: NotFoundComponent,
    defaultErrorComponent: ErrorComponent,
    dehydrate: () => ({
      atoms: Hydration.dehydrate(routerContext.registry),
    }),
    hydrate: (state) => {
      Hydration.hydrate(routerContext.registry, state.atoms);
    },
    Wrap: ({ children }) => (
      <RegistryContext.Provider value={routerContext.registry}>{children}</RegistryContext.Provider>
    ),
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
  });

  return router;
}
