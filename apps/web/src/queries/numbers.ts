import { api } from "~/lib/query";

export function addNumberMutationOptions() {
  return api.numbers.add.mutationOptions({
    onSuccess: (item, _variables, _onMutateResult, context) => {
      context.client.setQueryData(api.numbers.getAll.queryKey(), (items = []) => [...items, item]);
      context.client.setQueryData(api.numbers.get.queryKey({ params: { id: item.id } }), item);
    },
  });
}

export function updateNumberMutationOptions() {
  return api.numbers.update.mutationOptions({
    onSuccess: (item, _variables, _onMutateResult, context) => {
      context.client.setQueryData(api.numbers.getAll.queryKey(), (items = []) =>
        items.map((current) => (current.id === item.id ? item : current)),
      );
      context.client.setQueryData(api.numbers.get.queryKey({ params: { id: item.id } }), item);
    },
  });
}

export function deleteNumberMutationOptions() {
  return api.numbers.delete.mutationOptions({
    onSuccess: (id, _variables, _onMutateResult, context) => {
      context.client.setQueryData(api.numbers.getAll.queryKey(), (items = []) =>
        items.filter((item) => item.id !== id),
      );
      context.client.removeQueries(api.numbers.get.queryFilter({ params: { id } }));
    },
  });
}

export function deleteAllNumbersMutationOptions() {
  return api.numbers.deleteAll.mutationOptions({
    onSuccess: (ids, _variables, _onMutateResult, context) => {
      const deletedIds = new Set(ids);
      context.client.setQueryData(api.numbers.getAll.queryKey(), (items = []) =>
        items.filter((item) => !deletedIds.has(item.id)),
      );
      context.client.removeQueries(api.numbers.get.queryFilter());
    },
  });
}
