import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import type { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import type { TRPCInput, TRPCOutput } from "@reactlith-template/rpc";
import { MaxCountReached } from "@reactlith-template/rpc/errors/numbers";
import { toastManager } from "~/components/ui/toast";
import { getRPC, matchError } from "~/lib/rpc";

export const allNumbersQueryOptions = queryOptions({
  queryKey: ["numbers", "getAll"],
  queryFn: async ({ signal }) => getRPC().numbers.getAll.query(undefined, { signal }),
});

export const numbersAbove50QueryOptions = queryOptions({
  queryKey: ["numbers", "getCountAbove50"],
  queryFn: async ({ signal }) => getRPC().numbers.getCountAbove50.query(undefined, { signal }),
});

export const numberQueryKey = {
  all: () => ["numbers", "getById"] as const,
  byId: (id: IdBranded<"number">) => ["numbers", "getById", id] as const,
};

export function getNumberQueryOptions(input: TRPCInput["numbers"]["getById"]) {
  return queryOptions({
    queryKey: numberQueryKey.byId(input.id),
    queryFn: async ({ signal }) => getRPC().numbers.getById.query(input, { signal }),
  });
}

export function useAddNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TRPCInput["numbers"]["addNew"]) =>
      getRPC().numbers.addNew.mutate(input),
    onError: async (error: unknown) => {
      if (matchError(error, MaxCountReached)) {
        toastManager.add({
          title: m.example_maxNumberCountReached(),
          description: m.example_maxNumberCountReachedDescription({
            maxCount: error.data.resultError.maxCount,
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
    mutationFn: async (input: TRPCInput["numbers"]["update"]) =>
      getRPC().numbers.update.mutate(input),
    onMutate: async (input) => {
      const detailQueryKey = getNumberQueryOptions({ id: input.id }).queryKey;
      await Promise.all([
        queryClient.cancelQueries({ queryKey: allNumbersQueryOptions.queryKey }),
        queryClient.cancelQueries({ queryKey: detailQueryKey }),
      ]);

      const previousAllNumbers = queryClient.getQueryData(allNumbersQueryOptions.queryKey);
      const previousNumber = queryClient.getQueryData(detailQueryKey);

      queryClient.setQueryData(detailQueryKey, (number) =>
        number ? { ...number, ...input.data } : number,
      );
      queryClient.setQueryData(allNumbersQueryOptions.queryKey, (data) =>
        data
          ? {
              numbers: data.numbers.map((number) =>
                number.id === input.id ? { ...number, ...input.data } : number,
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
    mutationFn: async (input: TRPCInput["numbers"]["delete"]) =>
      getRPC().numbers.delete.mutate(input),
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
    mutationFn: async () => getRPC().numbers.deleteAll.mutate(),
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: allNumbersQueryOptions.queryKey }),
        queryClient.cancelQueries({ queryKey: numberQueryKey.all() }),
      ]);

      const previousAllNumbers = queryClient.getQueryData(allNumbersQueryOptions.queryKey);
      const previousNumbers = queryClient.getQueriesData<TRPCOutput["numbers"]["getById"]>({
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
