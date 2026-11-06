import { Effect, Schema } from "effect";
import { AsyncResult, Atom, AtomRegistry } from "effect/reactivity";

// Only successful reads are dehydrated; loader failures belong to the router's error boundary.
export function makeQueryAtom<S extends Schema.ConstraintCodec<unknown, unknown>, E>(
  key: string,
  read: () => Effect.Effect<S["Type"], E>,
  success: S,
) {
  return Atom.make(read).pipe(
    Atom.setIdleTTL("5 minutes"),
    Atom.serializable({
      key,
      schema: AsyncResult.Schema({ success, error: Schema.Never }),
      skipInitialRun: true,
    }),
  );
}

export async function readAtom<A, E>(
  registry: AtomRegistry.AtomRegistry,
  atom: Atom.Atom<AsyncResult.AsyncResult<A, E>>,
  signal?: AbortSignal,
) {
  return await Effect.runPromise(AtomRegistry.getResult(registry, atom), { signal });
}
