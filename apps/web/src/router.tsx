import { RegistryContext } from "@effect/atom-react";
import { createRouter } from "@tanstack/react-router";
import * as Hydration from "effect/unstable/reactivity/Hydration";

import { ErrorComponent } from "./components/router-default/error-component";
import { NotFoundComponent } from "./components/router-default/not-found-component";
import { PendingComponent } from "./components/router-default/pending-component";
import { createAtomRegistry } from "./lib/atom";
import { setupClientLog } from "./lib/log";
import { routeTree } from "./routeTree.gen";

setupClientLog();

export function getRouter() {
  const atomRegistry = createAtomRegistry();

  const router = createRouter({
    context: { atomRegistry },

    dehydrate: () => ({ atomState: Hydration.dehydrate(atomRegistry) }),
    hydrate: ({ atomState }) => Hydration.hydrate(atomRegistry, atomState),
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPreload: "intent",
    defaultPendingComponent: PendingComponent,
    defaultNotFoundComponent: NotFoundComponent,
    defaultErrorComponent: ErrorComponent,
    Wrap: (props) => {
      return (
        <RegistryContext.Provider value={atomRegistry}>{props.children}</RegistryContext.Provider>
      );
    },
  });

  return router;
}
