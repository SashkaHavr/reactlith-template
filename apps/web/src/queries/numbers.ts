import { mutationOptions } from "@tanstack/react-query";

import type { NumberId } from "@reactlith-template/api/numbers";

import { api } from "./utils";

export function addNumberMutationOptions() {
  return mutationOptions({
    mutationFn: async (number: number) =>
      api((client) => client.numbers.add({ payload: { number } })),
  });
}

export function updateNumberMutationOptions() {
  return mutationOptions({
    mutationFn: async ({ id, number }: { id: NumberId; number: number }) =>
      api((client) => client.numbers.update({ params: { id }, payload: { number } })),
  });
}

export function deleteAllNumbersMutationOptions() {
  return mutationOptions({
    mutationFn: async () => api((client) => client.numbers.deleteAll()),
  });
}
