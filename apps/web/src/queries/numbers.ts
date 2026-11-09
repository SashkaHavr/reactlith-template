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
import { apiRuntime, ApiClient } from "~/lib/api";
import { AppAtom } from "~/lib/atom";

type Input = ApiInput["numbers"];

export const allNumbersAtom = apiRuntime
  .atom(ApiClient.use((client) => client.numbers.getAll()))
  .pipe(
    AppAtom.writable,
    AppAtom.serializable({
      key: "numbers/getAll",
      schema: AsyncResult.Schema({ success: NumbersGetAllOutput }),
    }),
    AppAtom.swr,
  );

export const numbersAbove50Atom = apiRuntime
  .atom(ApiClient.use((client) => client.numbers.getCountAbove50()))
  .pipe(
    AppAtom.serializable({
      key: "numbers/getCountAbove50",
      schema: AsyncResult.Schema({ success: NumbersGetCountAbove50Output }),
    }),
    AppAtom.swr,
  );

export const numberAtom = Atom.family((id: IdBranded<"number">) =>
  apiRuntime.atom(ApiClient.use((client) => client.numbers.get({ params: { id } }))).pipe(
    AppAtom.writable,
    AppAtom.serializable({
      key: `numbers/get/${id}`,
      schema: AsyncResult.Schema({ success: NumbersGetOutput, error: NumberNotFound }),
    }),
    AppAtom.swr,
  ),
);

export const addNumberAtom = apiRuntime.fn<Input["create"]["payload"]>()(
  (payload, get) =>
    ApiClient.use((client) => client.numbers.create({ payload })).pipe(
      Effect.tapErrorTag("MaxCountReached", (error) =>
        Effect.sync(() => {
          toastManager.add({
            title: m.example_maxNumberCountReached(),
            description: m.example_maxNumberCountReachedDescription({
              maxCount: error.maxCount,
            }),
            type: "error",
          });
        }),
      ),
      Effect.onExit(() => {
        get.refresh(allNumbersAtom);
        return get.result(allNumbersAtom, { suspendOnWaiting: true });
      }),
    ),
  { concurrent: true },
);

export const updateNumberAtom = Atom.family((id: IdBranded<"number">) =>
  apiRuntime.fn<Input["update"]["payload"]>()((payload, get) =>
    ApiClient.use((client) => client.numbers.update({ params: { id }, payload })).pipe(
      Effect.tapError(() =>
        Effect.sync(() => {
          get.refresh(allNumbersAtom);
          get.refresh(numberAtom(id));
        }),
      ),
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
  apiRuntime
    .fn((_, get) =>
      ApiClient.use((client) => client.numbers.delete({ params: { id } })).pipe(
        Effect.tapError(() =>
          Effect.sync(() => {
            get.refresh(allNumbersAtom);
            get.refresh(numberAtom(id));
          }),
        ),
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
    )
    .pipe(AppAtom.nonConcurrent),
);

export const deleteAllNumbersAtom = apiRuntime.fn((_, get) =>
  ApiClient.use((client) => client.numbers.deleteAll()).pipe(
    Effect.onExit(() => {
      get.refresh(allNumbersAtom);
      return get.result(allNumbersAtom, { suspendOnWaiting: true });
    }),
  ),
);
