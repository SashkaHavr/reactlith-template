import { useMutation, useQueryClient } from "@tanstack/react-query";

import { m } from "@reactlith-template/intl/messages";
import { MaxCountReached } from "@reactlith-template/trpc/errors/numbers";
import { toastManager } from "~/components/ui/toast";
import { matchError, useTRPC } from "~/lib/trpc";

export function useAddNumber() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.numbers.addNew.mutationOptions({
      onError: async (error) => {
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
          queryKey: trpc.numbers.getAll.queryKey(),
          refetchType: "all",
        });
      },
    }),
  );
}

export function useUpdateNumber() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.numbers.update.mutationOptions({
      onSuccess: async (number) => {
        queryClient.setQueryData(trpc.numbers.getById.queryKey({ id: number.id }), number);
        queryClient.setQueryData(trpc.numbers.getAll.queryKey(), (data) =>
          data
            ? {
                numbers: data.numbers.map((current) =>
                  current.id === number.id ? number : current,
                ),
              }
            : data,
        );
      },
    }),
  );
}

export function useDeleteNumber(options?: { onSuccess?: () => Promise<void> | void }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.numbers.delete.mutationOptions({
      onSuccess: async ({ id }) => {
        queryClient.setQueryData(trpc.numbers.getAll.queryKey(), (data) =>
          data ? { numbers: data.numbers.filter((number) => number.id !== id) } : data,
        );
        await options?.onSuccess?.();
        queryClient.removeQueries({ queryKey: trpc.numbers.getById.queryKey({ id }) });
      },
    }),
  );
}

export function useDeleteAllNumbers() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.numbers.deleteAll.mutationOptions({
      onSuccess: () => {
        queryClient.setQueryData(trpc.numbers.getAll.queryKey(), { numbers: [] });
        queryClient.removeQueries({ queryKey: trpc.numbers.getById.queryKey() });
      },
    }),
  );
}
