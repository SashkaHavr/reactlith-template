import { mutationOptions, queryOptions } from "@tanstack/react-query";

import { api, queryKey } from "./utils";

export function getAllNumbersQueryOptions() {
  return queryOptions({
    queryKey: queryKey("numbers", "getAll"),
    queryFn: async () => api((client) => client.numbers.getAll()),
  });
}

export function getNumberQueryOptions(id: string) {
  return queryOptions({
    queryKey: queryKey("numbers", "get", { params: { id } }),
    queryFn: async () => api((client) => client.numbers.get({ params: { id } })),
  });
}

export function addNumberMutationOptions() {
  return mutationOptions({
    mutationFn: async (number: number) =>
      api((client) => client.numbers.add({ payload: { number } })),
  });
}

export function updateNumberMutationOptions() {
  return mutationOptions({
    mutationFn: async ({ id, number }: { id: string; number: number }) =>
      api((client) => client.numbers.update({ params: { id }, payload: { number } })),
  });
}

export function deleteAllNumbersMutationOptions() {
  return mutationOptions({
    mutationFn: async () => api((client) => client.numbers.deleteAll()),
  });
}
