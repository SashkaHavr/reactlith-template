import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { m } from "@reactlith-template/intl/messages";
import type { TRPCInput } from "@reactlith-template/trpc";
import { MaxCountReached } from "@reactlith-template/trpc/errors/numbers";
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

const numberQueryKey = ["numbers", "getById"] as const;

export function getNumberQueryOptions(input: TRPCInput["numbers"]["getById"]) {
  return queryOptions({
    queryKey: [...numberQueryKey, input],
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

export function useDeleteNumber(options?: { onSuccess?: () => Promise<void> | void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TRPCInput["numbers"]["delete"]) =>
      getRPC().numbers.delete.mutate(input),
    onSuccess: async ({ id }) => {
      queryClient.setQueryData(allNumbersQueryOptions.queryKey, (data) =>
        data ? { numbers: data.numbers.filter((number) => number.id !== id) } : data,
      );
      await options?.onSuccess?.();
      queryClient.removeQueries({ queryKey: getNumberQueryOptions({ id }).queryKey });
    },
  });
}

export function useDeleteAllNumbers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => getRPC().numbers.deleteAll.mutate(),
    onSuccess: () => {
      queryClient.setQueryData(allNumbersQueryOptions.queryKey, { numbers: [] });
      queryClient.removeQueries({ queryKey: numberQueryKey });
    },
  });
}
