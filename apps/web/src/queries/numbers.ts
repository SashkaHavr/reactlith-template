import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { Effect } from "effect";

import type { ApiErrors, ApiInput } from "@reactlith-template/api-contract";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import { toastManager } from "~/components/ui/toast";
import { getApiClient } from "~/lib/api";

type Input = ApiInput["numbers"];
type Errors = ApiErrors["numbers"];

export const numberQueryKey = {
  base: () => ["numbers"] as const,
  getAll: () => ["numbers", "getAll"] as const,
  allById: () => ["numbers", "get"] as const,
  byId: (id: IdBranded<"number">) => ["numbers", "get", id] as const,
  countAbove50: () => ["numbers", "getAll", "getCountAbove50"] as const,
} satisfies Record<string, (...args: any[]) => ["numbers", ...rest: any[]]>;

export const allNumbersQueryOptions = queryOptions({
  queryKey: numberQueryKey.getAll(),
  queryFn: async ({ signal }) => {
    return await Effect.runPromise(getApiClient().numbers.getAll(), { signal });
  },
});

export const numbersAbove50QueryOptions = queryOptions({
  queryKey: numberQueryKey.countAbove50(),
  queryFn: async ({ signal }) => {
    return await Effect.runPromise(getApiClient().numbers.getCountAbove50(), { signal });
  },
});

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
        queryKey: numberQueryKey.getAll(),
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
    onSuccess: async (number) => {
      void queryClient.invalidateQueries({
        queryKey: numberQueryKey.getAll(),
        refetchType: "all",
      });
      void queryClient.invalidateQueries({
        queryKey: numberQueryKey.byId(number.id),
        refetchType: "all",
      });
    },
  });
}

export function useDeleteNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Input["delete"]["params"]) => {
      return await Effect.runPromise(getApiClient().numbers.delete({ params: input }));
    },
    onSuccess: async ({ id }) => {
      queryClient.removeQueries({ queryKey: numberQueryKey.byId(id) });
      void queryClient.invalidateQueries({
        queryKey: numberQueryKey.getAll(),
        refetchType: "all",
      });
    },
  });
}

export function useDeleteAllNumbers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await Effect.runPromise(getApiClient().numbers.deleteAll());
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: numberQueryKey.allById() });
      void queryClient.invalidateQueries({ queryKey: numberQueryKey.getAll(), refetchType: "all" });
    },
  });
}
