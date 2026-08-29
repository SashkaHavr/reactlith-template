import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { Effect } from "effect";

import type { ApiErrors, ApiInput, ApiOutput } from "@reactlith-template/api";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import { toastManager } from "~/components/ui/toast";
import { getApi } from "~/lib/api";

type Input = ApiInput["numbers"];
type Output = ApiOutput["numbers"];
type Errors = ApiErrors["numbers"];

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

export function getNumberQueryOptions(input: Input["getById"]["params"]) {
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
    mutationFn: async (input: Input["addNew"]["payload"]) => {
      const api = await getApi();
      return await Effect.runPromise(api.numbers.addNew({ payload: input }));
    },
    onError: async (error: Errors["addNew"]) => {
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
      const api = await getApi();
      return await Effect.runPromise(
        api.numbers.update({ params: { id: input.id }, payload: input.payload }),
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
      const previousNumbers = queryClient.getQueriesData<Output["getById"]>({
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
