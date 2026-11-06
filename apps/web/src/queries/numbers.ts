import { Effect, Schema } from "effect";
import { AsyncResult, Atom } from "effect/reactivity";

import type { ApiInput } from "@reactlith-template/api-contract";
import { NumberOutput } from "@reactlith-template/api-contract/features/numbers";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import { toastManager } from "~/components/ui/toast";
import { getApiClient } from "~/lib/api";

type Input = ApiInput["numbers"];

export const allNumbersAtom = Atom.make(() => getApiClient().numbers.getAll()).pipe(
  Atom.serializable({
    key: "numbers/getAll",
    schema: AsyncResult.Schema({
      success: Schema.Struct({ numbers: Schema.Array(NumberOutput) }),
    }),
    skipInitialRun: true,
  }),
  Atom.swr({
    staleTime: 0,
    revalidateOnFocus: true,
    focusSignal: Atom.windowFocusSignal,
  }),
);

export const numbersAbove50Atom = Atom.make(() => getApiClient().numbers.getCountAbove50()).pipe(
  Atom.serializable({
    key: "numbers/getCountAbove50",
    schema: AsyncResult.Schema({
      success: Schema.Struct({ count: Schema.Natural }),
    }),
    skipInitialRun: true,
  }),
  Atom.swr({
    staleTime: 0,
    revalidateOnFocus: true,
    focusSignal: Atom.windowFocusSignal,
  }),
);

export const numberAtom = Atom.family((id: IdBranded<"number">) =>
  Atom.make(() => getApiClient().numbers.get({ params: { id } })).pipe(
    Atom.serializable({
      key: `numbers/get/${id}`,
      schema: AsyncResult.Schema({ success: NumberOutput }),
      skipInitialRun: true,
    }),
    Atom.swr({
      staleTime: 0,
      revalidateOnFocus: true,
      focusSignal: Atom.windowFocusSignal,
    }),
  ),
);

export const addNumberAtom = Atom.fn<Input["create"]["payload"]>()((input, get) =>
  getApiClient()
    .numbers.create({ payload: input })
    .pipe(
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
  Atom.fn<Input["update"]["payload"]>()((payload, get) =>
    getApiClient()
      .numbers.update({ params: { id }, payload })
      .pipe(
        Effect.tap((number) => {
          get.refresh(allNumbersAtom);
          get.refresh(numberAtom(number.id));
          return Effect.all(
            [
              get.result(allNumbersAtom, { suspendOnWaiting: true }),
              get.result(numberAtom(number.id), { suspendOnWaiting: true }),
            ],
            { concurrency: "unbounded", discard: true },
          );
        }),
      ),
  ),
);

export const deleteNumberAtom = Atom.family((id: IdBranded<"number">) =>
  Atom.fn((_: void, get) =>
    getApiClient()
      .numbers.delete({ params: { id } })
      .pipe(
        Effect.tap(({ id }) => {
          get.refresh(allNumbersAtom);
          get.refresh(numberAtom(id));
          return get.result(allNumbersAtom, { suspendOnWaiting: true });
        }),
      ),
  ),
);

export const deleteAllNumbersAtom = Atom.fn((_: void, get) =>
  getApiClient()
    .numbers.deleteAll()
    .pipe(
      Effect.tap(() => {
        get.refresh(allNumbersAtom);
        return get.result(allNumbersAtom, { suspendOnWaiting: true });
      }),
    ),
);
