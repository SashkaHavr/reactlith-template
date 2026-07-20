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
    },
  });
}

export function updateNumberMutationOptions() {
  return api.numbers.update.mutationOptions();
}

export function deleteAllNumbersMutationOptions() {
  return api.numbers.deleteAll.mutationOptions();
}
