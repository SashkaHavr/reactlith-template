import { collectionOptions, createOptimisticAction } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { useDbClient } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { Effect, Schema } from "effect";

import type { ApiErrors, ApiInput } from "@reactlith-template/api";
import { NumberFullOutput, NumberInput } from "@reactlith-template/api/schema/numbers";
import type { IdBranded } from "@reactlith-template/db/id-branded";
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

export const numbersCollection = collectionOptions("numbers", (client) =>
  queryCollectionOptions({
    id: "numbers",
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    getKey: (item) => item.id,
    schema: NumberFullOutput.mapFields((s) => ({
      ...s,
      updatedAt: Schema.optional(s.updatedAt),
    })).pipe(Schema.toType, Schema.toStandardSchemaV1),
    queryKey: () => {
      return ["numbers", "getAll"];
    },
    queryFn: async ({ signal }) => {
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

export function useUpdateNumber() {
  const numbers = useDbClient().collection(numbersCollection);

  return createOptimisticAction<{ id: IdBranded<"number">; payload: typeof NumberInput.Type }>({
    onMutate: (input) => {
      const payload = Schema.decodeSync(NumberInput)(input.payload);
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
