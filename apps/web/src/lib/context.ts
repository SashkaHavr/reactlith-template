import { AtomRegistry } from "effect/reactivity";

export function createRouterContext() {
  const registry = AtomRegistry.make({ defaultIdleTTL: 5 * 60 * 1000 });
  return { registry };
}

export type RouterContext = ReturnType<typeof createRouterContext>;
