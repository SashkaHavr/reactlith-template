import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { Effect } from "effect";

import type { ApiErrors, ApiInput, ApiOutput } from "@reactlith-template/api";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import { toastManager } from "~/components/ui/toast";
import { getApiClient } from "~/lib/api";

type Input = ApiInput["numbers"];
type Output = ApiOutput["numbers"];
type Errors = ApiErrors["numbers"];

export const allNumbersQueryOptions = queryOptions({
  queryKey: ["numbers", "getAll"],
  queryFn: async ({ signal }) => {
    return await Effect.runPromise(getApiClient().numbers.getAll(), { signal });
  },
});

export const numbersAbove50QueryOptions = queryOptions({
  queryKey: ["numbers", "getCountAbove50"],
  queryFn: async ({ signal }) => {
    return await Effect.runPromise(getApiClient().numbers.getCountAbove50(), { signal });
  },
});

export const numberQueryKey = {
  all: () => ["numbers", "get"] as const,
  byId: (id: IdBranded<"number">) => ["numbers", "get", id] as const,
};

export function getNumberQueryOptions(input: Input["get"]["params"]) {
  return queryOptions({
    queryKey: numberQueryKey.byId(input.id),
    queryFn: async ({ signal }) => {
      return await Effect.runPromise(getApiClient().numbers.get({ params: input }), { signal });
    },
  });
}

export function useAddNumber() {
  const queryClient = useQueryClient();

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: allNumbersQueryOptions.queryKey,
        refetchType: "all",
      });
    },
  });
}

export function useUpdateNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: Input["update"]["params"] & {
        payload: Input["update"]["payload"];
      },
    ) => {
      return await Effect.runPromise(
        getApiClient().numbers.update({ params: { id: input.id }, payload: input.payload }),
      );
    },
    onMutate: async (input) => {
      const detailQueryKey = getNumberQueryOptions({ id: input.id }).queryKey;
      await Promise.all([
        queryClient.cancelQueries({ queryKey: allNumbersQueryOptions.queryKey }),
        queryClient.cancelQueries({ queryKey: detailQueryKey }),
      ]);

      const previousAllNumbers = queryClient.getQueryData(allNumbersQueryOptions.queryKey);
      const previousNumber = queryClient.getQueryData(detailQueryKey);

      queryClient.setQueryData(detailQueryKey, (number) =>
        number ? { ...number, ...input.payload } : number,
      );
      queryClient.setQueryData(allNumbersQueryOptions.queryKey, (data) =>
        data
          ? {
              numbers: data.numbers.map((number) =>
                number.id === input.id ? { ...number, ...input.payload } : number,
              ),
            }
          : data,
      );

      return { detailQueryKey, previousAllNumbers, previousNumber };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(allNumbersQueryOptions.queryKey, context.previousAllNumbers);
      queryClient.setQueryData(context.detailQueryKey, context.previousNumber);
    },
    onSuccess: async (number) => {
      queryClient.setQueryData(getNumberQueryOptions({ id: number.id }).queryKey, number);
      queryClient.setQueryData(allNumbersQueryOptions.queryKey, (data) =>
        data
          ? {
              numbers: data.numbers.map((current) => (current.id === number.id ? number : current)),
            }
          : data,
      );
    },
  });
}

export function useDeleteNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Input["delete"]["params"]) => {
      return await Effect.runPromise(getApiClient().numbers.delete({ params: input }));
    },
    onMutate: async ({ id }) => {
      const detailQueryKey = getNumberQueryOptions({ id }).queryKey;
      await Promise.all([
        queryClient.cancelQueries({ queryKey: allNumbersQueryOptions.queryKey }),
        queryClient.cancelQueries({ queryKey: detailQueryKey }),
      ]);

      const previousAllNumbers = queryClient.getQueryData(allNumbersQueryOptions.queryKey);
      const previousNumber = queryClient.getQueryData(detailQueryKey);

      queryClient.setQueryData(allNumbersQueryOptions.queryKey, (data) =>
        data ? { numbers: data.numbers.filter((number) => number.id !== id) } : data,
      );
      queryClient.removeQueries({ queryKey: detailQueryKey });

      return { detailQueryKey, previousAllNumbers, previousNumber };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(allNumbersQueryOptions.queryKey, context.previousAllNumbers);
      if (context.previousNumber) {
        queryClient.setQueryData(context.detailQueryKey, context.previousNumber);
      }
    },
    onSuccess: async ({ id }) => {
      queryClient.removeQueries({ queryKey: getNumberQueryOptions({ id }).queryKey });
    },
  });
}

export function useDeleteAllNumbers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await Effect.runPromise(getApiClient().numbers.deleteAll());
    },
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: allNumbersQueryOptions.queryKey }),
        queryClient.cancelQueries({ queryKey: numberQueryKey.all() }),
      ]);

      const previousAllNumbers = queryClient.getQueryData(allNumbersQueryOptions.queryKey);
      const previousNumbers = queryClient.getQueriesData<Output["get"]>({
        queryKey: numberQueryKey.all(),
      });

      queryClient.setQueryData(allNumbersQueryOptions.queryKey, (data) =>
        data ? { numbers: [] } : data,
      );
      queryClient.removeQueries({ queryKey: numberQueryKey.all() });

      return { previousAllNumbers, previousNumbers };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(allNumbersQueryOptions.queryKey, context.previousAllNumbers);
      for (const [queryKey, number] of context.previousNumbers) {
        queryClient.setQueryData(queryKey, number);
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: numberQueryKey.all() });
    },
  });
}
