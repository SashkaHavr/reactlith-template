import { useMutation } from "@tanstack/react-query";

import { mutationOptions, partialQueryKey, queryKey } from "~/lib/query";

export function useAddNumberMutationOptions() {
  return useMutation(
    mutationOptions(
      { group: "numbers", endpoint: "add" },
      {
        onSuccess: (item, _variables, _onMutateResult, context) => {
          context.client.setQueryData(queryKey("numbers", "getAll"), (items = []) => [
            ...items,
            item,
          ]);
          context.client.setQueryData(
            queryKey("numbers", "get", { params: { id: item.id } }),
            item,
          );
        },
      },
    ),
  );
}

export function useUpdateNumberMutationOptions() {
  return useMutation(
    mutationOptions(
      { group: "numbers", endpoint: "update" },
      {
        onSuccess: (item, _variables, _onMutateResult, context) => {
          context.client.setQueryData(queryKey("numbers", "getAll"), (items = []) =>
            items.map((current) => (current.id === item.id ? item : current)),
          );
          context.client.setQueryData(
            queryKey("numbers", "get", { params: { id: item.id } }),
            item,
          );
        },
      },
    ),
  );
}

export function useDeleteNumberMutationOptions() {
  return useMutation(
    mutationOptions(
      { group: "numbers", endpoint: "delete" },
      {
        onSuccess: (id, _variables, _onMutateResult, context) => {
          context.client.setQueryData(queryKey("numbers", "getAll"), (items = []) =>
            items.filter((item) => item.id !== id),
          );
          context.client.removeQueries({
            queryKey: queryKey("numbers", "get", { params: { id } }),
          });
        },
      },
    ),
  );
}

export function useDeleteAllNumbersMutationOptions() {
  return useMutation(
    mutationOptions(
      { group: "numbers", endpoint: "deleteAll" },
      {
        onSuccess: (ids, _variables, _onMutateResult, context) => {
          const deletedIds = new Set(ids);
          context.client.setQueryData(queryKey("numbers", "getAll"), (items = []) =>
            items.filter((item) => !deletedIds.has(item.id)),
          );
          context.client.removeQueries({ queryKey: partialQueryKey("numbers", "get") });
        },
      },
    ),
  );
}
