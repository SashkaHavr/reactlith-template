import { Effect, Schema } from "effect";
import { Atom } from "effect/reactivity";

import type { ApiInput } from "@reactlith-template/api-contract";
import { NumberOutput } from "@reactlith-template/api-contract/features/numbers";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import { toastManager } from "~/components/ui/toast";
import { getApiClient } from "~/lib/api";
import { makeQueryAtom } from "~/lib/atom";

type Input = ApiInput["numbers"];

export const allNumbersAtom = makeQueryAtom(
  "numbers/getAll",
  () => getApiClient().numbers.getAll(),
  Schema.Struct({ numbers: Schema.Array(NumberOutput) }),
);

export const numbersAbove50Atom = makeQueryAtom(
  "numbers/getCountAbove50",
  () => getApiClient().numbers.getCountAbove50(),
  Schema.Struct({ count: Schema.Natural }),
);

export const numberAtom = Atom.family((id: IdBranded<"number">) =>
  makeQueryAtom(
    `numbers/get/${id}`,
    () => getApiClient().numbers.get({ params: { id } }),
    NumberOutput,
  ),
);

function refreshNumbers(get: Atom.FnContext) {
  get.refresh(allNumbersAtom);
  get.refresh(numbersAbove50Atom);
}

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
      Effect.tap(() => Effect.sync(() => refreshNumbers(get))),
      Effect.tap(() => get.result(allNumbersAtom, { suspendOnWaiting: true })),
    ),
);

export const updateNumberAtom = Atom.fn<
  Input["update"]["params"] & { payload: Input["update"]["payload"] }
>()(
  (input, get) =>
    getApiClient()
      .numbers.update({ params: { id: input.id }, payload: input.payload })
      .pipe(
        Effect.tap((number) =>
          Effect.sync(() => {
            refreshNumbers(get);
            get.refresh(numberAtom(number.id));
          }),
        ),
      ),
  { concurrent: true },
);

export const deleteNumberAtom = Atom.fn<Input["delete"]["params"]>()(
  (input, get) =>
    getApiClient()
      .numbers.delete({ params: input })
      .pipe(
        Effect.tap(({ id }) =>
          Effect.sync(() => {
            refreshNumbers(get);
            get.refresh(numberAtom(id));
          }),
        ),
      ),
  { concurrent: true },
);

export const deleteAllNumbersAtom = Atom.fn((_: void, get) =>
  getApiClient()
    .numbers.deleteAll()
    .pipe(
      Effect.tap(() =>
        Effect.sync(() => {
          refreshNumbers(get);
          for (const node of get.registry.getNodes().values()) {
            if (
              Atom.isSerializable(node.atom) &&
              node.atom[Atom.SerializableTypeId].key.startsWith("numbers/get/")
            ) {
              get.refresh(node.atom);
            }
          }
        }),
      ),
    ),
);
