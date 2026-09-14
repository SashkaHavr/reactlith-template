import { collectionOptions, createOptimisticAction, parseLoadSubsetOptions } from "@tanstack/db";
import type { LoadSubsetOptions } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { useDbClient } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { Effect, Schema } from "effect";
import { Option } from "effect";

import type { ApiErrors, ApiInput } from "@reactlith-template/api";
import { NumberSchema, NumberValue } from "@reactlith-template/api/schema/numbers";
import { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import { toastManager } from "~/components/ui/toast";
import { getApiClient } from "~/lib/api";

type Input = ApiInput["numbers"];
type Errors = ApiErrors["numbers"];

export const numbersAbove50QueryOptions = queryOptions({
  queryKey: ["numbers", "getCountAbove50"],
  queryFn: async ({ signal }) => {
    return await Effect.runPromise(getApiClient().numbers.getCountAbove50(), { signal });
  },
});

function parseNumbersCollectionOptions(loadSubsetOptions: LoadSubsetOptions | undefined) {
  const opts = parseLoadSubsetOptions(loadSubsetOptions);
  if (opts.filters.length === 1) {
    const idFilter = opts.filters[0];
    if (idFilter && idFilter.field.join(".") === "id" && idFilter.operator === "eq") {
      const value = Schema.decodeOption(IdBranded("number"))(idFilter.value).valueOrUndefined;
      if (value) {
        return { type: "byId", id: value } as const;
      }
    }
  }
  return { type: "all" } as const;
}

export const numbersCollection = collectionOptions("numbers", (client) =>
  queryCollectionOptions({
    id: "numbers",
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    getKey: (item) => item.id,
    syncMode: "on-demand",
    schema: NumberSchema.pipe(Schema.toType, Schema.toStandardSchemaV1),
    queryKey: (loadSubsetOptions) => {
      const opts = parseNumbersCollectionOptions(loadSubsetOptions);
      return ["numbers", ...(opts.type !== "all" ? [opts] : [])];
    },
    queryFn: async ({ signal, meta }) => {
      const opts = parseNumbersCollectionOptions(meta?.loadSubsetOptions);
      if (opts.type === "byId") {
        const number = await Effect.runPromise(
          getApiClient()
            .numbers.get({ params: { id: opts.id } })
            .pipe(
              Effect.asSome,
              Effect.catchTag("NumberNotFound", () => Effect.succeedNone),
            ),
          {
            signal,
          },
        );
        return Option.isSome(number) ? [number.value] : [];
      }
      return [...(await Effect.runPromise(getApiClient().numbers.getAll(), { signal })).numbers];
    },
  }),
);

export function useAddNumber() {
  const numbers = useDbClient().collection(numbersCollection);

  return useMutation({
    mutationFn: async (input: Input["create"]["payload"]) => {
      return await Effect.runPromise(getApiClient().numbers.create({ payload: input }));
    },
    onError: async (error: Errors["create"]) => {
      if (error._tag === "MaxCountReached") {
        toastManager.add({
          title: m.example_maxNumberCountReached(),
          description: m.example_maxNumberCountReachedDescription({
            maxCount: error.maxCount,
          }),
          type: "error",
        });
      }
    },
    onSuccess: async (number) => {
      numbers.utils.writeInsert(number);
    },
  });
}

const UpdateNumberSchema = Schema.Struct({ number: NumberValue });
export function useUpdateNumber() {
  const numbers = useDbClient().collection(numbersCollection);

  return createOptimisticAction<{
    id: IdBranded<"number">;
    payload: typeof UpdateNumberSchema.Type;
  }>({
    onMutate: (input) => {
      const payload = Schema.decodeSync(UpdateNumberSchema)(input.payload);
      numbers.update(input.id, (draft) => {
        draft.number = payload.number;
      });
    },
    mutationFn: async (input) => {
      const response = await Effect.runPromise(
        getApiClient().numbers.update({ params: { id: input.id }, payload: input.payload }),
      );
      numbers.utils.writeUpdate(response);
    },
  });
}

export function useDeleteNumber() {
  const numbers = useDbClient().collection(numbersCollection);

  return createOptimisticAction<IdBranded<"number">>({
    onMutate: (input) => {
      numbers.delete(input);
    },
    mutationFn: async (input) => {
      const response = await Effect.runPromise(
        getApiClient().numbers.delete({ params: { id: input } }),
      );
      numbers.utils.writeDelete(response.id);
    },
  });
}

export function useDeleteAllNumbers() {
  const numbers = useDbClient().collection(numbersCollection);

  return createOptimisticAction<void>({
    onMutate: () => {
      numbers.delete([...numbers.state.keys()]);
    },
    mutationFn: async () => {
      await Effect.runPromise(getApiClient().numbers.deleteAll());
      await numbers.utils.refetch();
    },
  });
}
