import { logError } from "~/lib/log";
import { api } from "~/lib/query";

export function addNumberMutationOptions() {
  return api.numbers.add.mutationOptions({
    onError: (error) => logError(error),
    onSuccess: (item, _variables, _onMutateResult, context) => {
      context.client.setQueryData(api.numbers.getAll.queryOptions().queryKey, (items = []) => [
        ...items,
        item,
      ]);
      context.client.setQueryData(
        api.numbers.get.queryOptions({ params: { id: item.id } }).queryKey,
        item,
      );
    },
  });
}

export function updateNumberMutationOptions() {
  return api.numbers.update.mutationOptions({
    onError: (error) => logError(error),
    onSuccess: (item, _variables, _onMutateResult, context) => {
      context.client.setQueryData(api.numbers.getAll.queryOptions().queryKey, (items = []) =>
        items.map((current) => (current.id === item.id ? item : current)),
      );
      context.client.setQueryData(
        api.numbers.get.queryOptions({ params: { id: item.id } }).queryKey,
        item,
      );
    },
  });
}

export function deleteNumberMutationOptions() {
  return api.numbers.delete.mutationOptions({
    onError: (error) => logError(error),
    onSuccess: (id, _variables, _onMutateResult, context) => {
      context.client.setQueryData(api.numbers.getAll.queryOptions().queryKey, (items = []) =>
        items.filter((item) => item.id !== id),
      );
      context.client.removeQueries({
        queryKey: api.numbers.get.queryOptions({ params: { id } }).queryKey,
      });
    },
  });
}

export function deleteAllNumbersMutationOptions() {
  return api.numbers.deleteAll.mutationOptions({
    onError: (error) => logError(error),
    onSuccess: (ids, _variables, _onMutateResult, context) => {
      const deletedIds = new Set(ids);
      context.client.setQueryData(api.numbers.getAll.queryOptions().queryKey, (items = []) =>
        items.filter((item) => !deletedIds.has(item.id)),
      );
      for (const id of ids) {
        context.client.removeQueries({
          queryKey: api.numbers.get.queryOptions({ params: { id } }).queryKey,
        });
      }
    },
  });
}
