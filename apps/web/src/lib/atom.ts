import type { Schema } from "effect";
import { Atom } from "effect/reactivity";

const writable = <A>(atom: Atom.Atom<A>) =>
  Atom.writable(atom.read, (ctx, value: A) => ctx.setSelf(value), atom.refresh);

const serializable = <
  R extends Atom.Atom<any>,
  S extends Schema.ConstraintCodec<Atom.Type<R>, any>,
>(options: {
  readonly key: string;
  readonly schema: S;
}) => Atom.serializable<R, S>({ ...options, skipInitialRun: true });

const swr = Atom.swr({
  staleTime: 0,
  revalidateOnFocus: true,
  focusSignal: Atom.windowFocusSignal,
});

const nonConcurrent = <Arg, A, E>(atom: Atom.AtomResultFn<Arg, A, E>) =>
  Atom.writable(
    (get) => get(atom),
    (ctx, value: Arg | Atom.Reset | Atom.Interrupt) => {
      if (value === Atom.Reset || value === Atom.Interrupt || !ctx.get(atom).waiting) {
        ctx.set(atom, value);
      }
    },
  );

export const AppAtom = { writable, serializable, swr, nonConcurrent };
