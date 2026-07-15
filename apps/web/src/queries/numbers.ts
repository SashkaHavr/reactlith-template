import { mutationOptions } from "@tanstack/react-query";

import { api } from "./utils";

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
