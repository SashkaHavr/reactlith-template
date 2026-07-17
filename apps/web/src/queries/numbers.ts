import { useAtomSet } from "@effect/atom-react";

import type { NumberId } from "@reactlith-template/api/numbers";
import { ApiClient, atomParams, reactivityKeys, withQuerySWR } from "~/lib/atom";

export const numbersAtom = ApiClient.query(
  "numbers",
  "getAll",
  atomParams({
    reactivityKeys: ["numbers"],
    serializationKey: "all",
  }),
).pipe(withQuerySWR);

const addNumberMutationAtom = ApiClient.mutation("numbers", "add");
export function useAddNumber() {
  const mutate = useAtomSet(addNumberMutationAtom);
  return (number: number) =>
    mutate({ payload: { number }, reactivityKeys: reactivityKeys(["numbers"]) });
}

const updateNumberMutationAtom = ApiClient.mutation("numbers", "update");
export function useUpdateNumber() {
  const mutate = useAtomSet(updateNumberMutationAtom);
  return ({ id, number }: { id: NumberId; number: number }) =>
    mutate({ params: { id }, payload: { number }, reactivityKeys: reactivityKeys(["numbers"]) });
}

const deleteAllNumbersMutationAtom = ApiClient.mutation("numbers", "deleteAll");
export function useDeleteAllNumbers() {
  const mutate = useAtomSet(deleteAllNumbersMutationAtom);
  return () => mutate({ reactivityKeys: reactivityKeys(["numbers"]) });
}
