import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { Effect } from "effect";

import type { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import type { AppApiClient } from "@reactlith-template/rpc";
import { MaxCountReached } from "@reactlith-template/rpc/schema/numbers";
import { toastManager } from "~/components/ui/toast";
import { getApi } from "~/lib/api";

type NumbersClient = AppApiClient["numbers"];
type ApiOutput<Tag extends keyof NumbersClient> = Effect.Success<ReturnType<NumbersClient[Tag]>>;
type GetByIdInput = Parameters<NumbersClient["getById"]>[0]["params"];
type AddNewInput = Parameters<NumbersClient["addNew"]>[0]["payload"];
type UpdateInput = Parameters<NumbersClient["update"]>[0]["params"] & {
  readonly data: Parameters<NumbersClient["update"]>[0]["payload"];
};
type DeleteInput = Parameters<NumbersClient["delete"]>[0]["params"];

export const allNumbersQueryOptions = queryOptions({
  queryKey: ["numbers", "getAll"],
  queryFn: async ({ signal }) => {
    const api = await getApi();
    return await Effect.runPromise(api.numbers.getAll(), { signal });
  },
});

export const numbersAbove50QueryOptions = queryOptions({
  queryKey: ["numbers", "getCountAbove50"],
  queryFn: async ({ signal }) => {
    const api = await getApi();
    return await Effect.runPromise(api.numbers.getCountAbove50(), { signal });
  },
});

export const numberQueryKey = {
  all: () => ["numbers", "getById"] as const,
  byId: (id: IdBranded<"number">) => ["numbers", "getById", id] as const,
};

export function getNumberQueryOptions(input: GetByIdInput) {
  return queryOptions({
    queryKey: numberQueryKey.byId(input.id),
    queryFn: async ({ signal }) => {
      const api = await getApi();
      return await Effect.runPromise(api.numbers.getById({ params: input }), { signal });
    },
  });
}

export function useAddNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddNewInput) => {
      const api = await getApi();
      return await Effect.runPromise(api.numbers.addNew({ payload: input }));
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
    mutationFn: async (input: UpdateInput) => {
      const api = await getApi();
      return await Effect.runPromise(
        api.numbers.update({ params: { id: input.id }, payload: input.data }),
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
    mutationFn: async (input: DeleteInput) => {
      const api = await getApi();
      return await Effect.runPromise(api.numbers.delete({ params: input }));
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
      const api = await getApi();
      return await Effect.runPromise(api.numbers.deleteAll());
    },
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: allNumbersQueryOptions.queryKey }),
        queryClient.cancelQueries({ queryKey: numberQueryKey.all() }),
      ]);

      const previousAllNumbers = queryClient.getQueryData(allNumbersQueryOptions.queryKey);
      const previousNumbers = queryClient.getQueriesData<ApiOutput<"getById">>({
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
