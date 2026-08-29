import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { Effect } from "effect";

import type { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import type { AppRpcClient } from "@reactlith-template/rpc";
import { MaxCountReached } from "@reactlith-template/rpc/schema/numbers";
import { toastManager } from "~/components/ui/toast";
import { getRPC } from "~/lib/rpc";

type RpcInput<Tag extends keyof AppRpcClient> = Parameters<AppRpcClient[Tag]>[0];
type RpcOutput<Tag extends keyof AppRpcClient> = Effect.Success<ReturnType<AppRpcClient[Tag]>>;

export const allNumbersQueryOptions = queryOptions({
  queryKey: ["numbers", "getAll"],
  queryFn: async ({ signal }) => {
    const rpc = await getRPC();
    return await Effect.runPromise(rpc["numbers.getAll"](), { signal });
  },
});

export const numbersAbove50QueryOptions = queryOptions({
  queryKey: ["numbers", "getCountAbove50"],
  queryFn: async ({ signal }) => {
    const rpc = await getRPC();
    return await Effect.runPromise(rpc["numbers.getCountAbove50"](), { signal });
  },
});

export const numberQueryKey = {
  all: () => ["numbers", "getById"] as const,
  byId: (id: IdBranded<"number">) => ["numbers", "getById", id] as const,
};

export function getNumberQueryOptions(input: RpcInput<"numbers.getById">) {
  return queryOptions({
    queryKey: numberQueryKey.byId(input.id),
    queryFn: async ({ signal }) => {
      const rpc = await getRPC();
      return await Effect.runPromise(rpc["numbers.getById"](input), { signal });
    },
  });
}

export function useAddNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RpcInput<"numbers.addNew">) => {
      const rpc = await getRPC();
      return await Effect.runPromise(rpc["numbers.addNew"](input));
    },
    onError: async (error: unknown) => {
      if (error instanceof MaxCountReached) {
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
    mutationFn: async (input: RpcInput<"numbers.update">) => {
      const rpc = await getRPC();
      return await Effect.runPromise(rpc["numbers.update"](input));
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
    mutationFn: async (input: RpcInput<"numbers.delete">) => {
      const rpc = await getRPC();
      return await Effect.runPromise(rpc["numbers.delete"](input));
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
      const rpc = await getRPC();
      return await Effect.runPromise(rpc["numbers.deleteAll"]());
    },
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: allNumbersQueryOptions.queryKey }),
        queryClient.cancelQueries({ queryKey: numberQueryKey.all() }),
      ]);

      const previousAllNumbers = queryClient.getQueryData(allNumbersQueryOptions.queryKey);
      const previousNumbers = queryClient.getQueriesData<RpcOutput<"numbers.getById">>({
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
