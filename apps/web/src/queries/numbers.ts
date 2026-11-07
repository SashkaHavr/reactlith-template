import { Effect } from "effect";
import { AsyncResult, Atom } from "effect/reactivity";

import type { ApiInput } from "@reactlith-template/api-contract";
import {
  NumberNotFound,
  NumbersGetAllOutput,
  NumbersGetOutput,
  NumbersGetCountAbove50Output,
} from "@reactlith-template/api-contract/features/numbers";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import { toastManager } from "~/components/ui/toast";
import { apiRuntime, RpcClient } from "~/lib/api";

type Input = ApiInput["numbers"];

export const allNumbersAtom = apiRuntime
  .atom(RpcClient.use((client) => client["numbers.getAll"]()))
  .pipe(
    (atom) =>
      Atom.writable(
        atom.read,
        (ctx, value: Atom.Type<typeof atom>) => ctx.setSelf(value),
        atom.refresh,
      ),
    Atom.serializable({
      key: "numbers/getAll",
      schema: AsyncResult.Schema({ success: NumbersGetAllOutput }),
      skipInitialRun: true,
    }),
    Atom.swr({
      staleTime: 0,
      revalidateOnFocus: true,
      focusSignal: Atom.windowFocusSignal,
    }),
  );

export const numbersAbove50Atom = apiRuntime
  .atom(RpcClient.use((client) => client["numbers.getCountAbove50"]()))
  .pipe(
    Atom.serializable({
      key: "numbers/getCountAbove50",
      schema: AsyncResult.Schema({ success: NumbersGetCountAbove50Output }),
      skipInitialRun: true,
    }),
    Atom.swr({
      staleTime: 0,
      revalidateOnFocus: true,
      focusSignal: Atom.windowFocusSignal,
    }),
  );

export const numberAtom = Atom.family((id: IdBranded<"number">) =>
  apiRuntime.atom(RpcClient.use((client) => client["numbers.get"]({ id }))).pipe(
    (atom) =>
      Atom.writable(
        atom.read,
        (ctx, value: Atom.Type<typeof atom>) => ctx.setSelf(value),
        atom.refresh,
      ),
    Atom.serializable({
      key: `numbers/get/${id}`,
      schema: AsyncResult.Schema({ success: NumbersGetOutput, error: NumberNotFound }),
      skipInitialRun: true,
    }),
    Atom.swr({
      staleTime: 0,
      revalidateOnFocus: true,
      focusSignal: Atom.windowFocusSignal,
    }),
  ),
);

export const addNumberAtom = apiRuntime.fn<Input["create"]>()((input, get) =>
  RpcClient.use((client) => client["numbers.create"](input)).pipe(
    Effect.tapError((error) =>
      Effect.sync(() => {
        if (error._tag === "MaxCountReached") {
          toastManager.add({
            title: m.example_maxNumberCountReached(),
            description: m.example_maxNumberCountReachedDescription({ maxCount: error.maxCount }),
            type: "error",
          });
        }
      }),
    ),
    Effect.tap(() => {
      get.refresh(allNumbersAtom);
      return get.result(allNumbersAtom, { suspendOnWaiting: true });
    }),
  ),
);

export const updateNumberAtom = Atom.family((id: IdBranded<"number">) =>
  apiRuntime.fn<Omit<Input["update"], "id">>()((payload, get) =>
    RpcClient.use((client) => client["numbers.update"]({ id, ...payload })).pipe(
      Effect.tap((number) =>
        Effect.sync(() => {
          get.set(
            allNumbersAtom,
            AsyncResult.map(get(allNumbersAtom), ({ numbers }) => ({
              numbers: numbers.map((current) => (current.id === number.id ? number : current)),
            })),
          );
          get.set(numberAtom(number.id), AsyncResult.success(number));
        }),
      ),
    ),
  ),
);

export const deleteNumberAtom = Atom.family((id: IdBranded<"number">) =>
  apiRuntime.fn((_: void, get) =>
    RpcClient.use((client) => client["numbers.delete"]({ id })).pipe(
      Effect.tap(({ id }) =>
        Effect.sync(() => {
          get.set(
            allNumbersAtom,
            AsyncResult.map(get(allNumbersAtom), ({ numbers }) => ({
              numbers: numbers.filter((number) => number.id !== id),
            })),
          );
          get.set(numberAtom(id), AsyncResult.fail(NumberNotFound.make({ numberId: id })));
        }),
      ),
    ),
  ),
);

export const deleteAllNumbersAtom = apiRuntime.fn((_: void, get) =>
  RpcClient.use((client) => client["numbers.deleteAll"]()).pipe(
    Effect.tap(() => {
      get.refresh(allNumbersAtom);
      return get.result(allNumbersAtom, { suspendOnWaiting: true });
    }),
  ),
);
