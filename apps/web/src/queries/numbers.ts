import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { DbClient } from "@tanstack/react-db";
import {
  collectionOptions,
  createOptimisticAction,
  eq,
  parseLoadSubsetOptions,
  Query,
  useDbClient,
} from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import type { Types } from "effect";
import { Effect, Schema, Option } from "effect";

import type { ApiInput, ApiOutput } from "@reactlith-template/api-contract";
import { NumberOutput } from "@reactlith-template/api-contract/features/numbers";
import { IdBranded } from "@reactlith-template/db/id-branded";
import { m } from "@reactlith-template/intl/messages";
import { toastManager } from "~/components/ui/toast";
import { getApiClient } from "~/lib/api";

const NumberId = IdBranded("number");
type Input = ApiInput["numbers"];
type Output = ApiOutput["numbers"];

export const numbersAbove50QueryOptions = queryOptions({
  queryKey: ["numbers", "getCountAbove50"],
  queryFn: async ({ signal }) => {
    return await Effect.runPromise(getApiClient().numbers.getCountAbove50(), { signal });
  },
});

export const numbersCollectionOptions = collectionOptions("numbers", (client) =>
  queryCollectionOptions({
    id: "numbers",
    queryKey: ["numbers"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    schema: NumberOutput.pipe(Schema.toType, Schema.toStandardSchemaV1),
    getKey: (item) => item.id,
    syncMode: "on-demand",
    queryFn: async (ctx) => {
      const opts = parseLoadSubsetOptions(ctx.meta?.loadSubsetOptions);
      const idFilter = opts.filters[0];
      if (idFilter && idFilter.field.join(".") === "id" && idFilter.operator === "eq") {
        const value = Schema.decodeOption(NumberId)(idFilter.value);
        if (value._tag === "Some") {
          return await Effect.runPromise(
            getApiClient()
              .numbers.get({ params: { id: value.value } })
              .pipe(
                Effect.asSome,
                Effect.catchTag("NumberNotFound", () => Effect.succeedNone),
                Effect.map(Option.toArray),
              ),
            {
              signal: ctx.signal,
            },
          );
        }
      }
      return (await Effect.runPromise(getApiClient().numbers.getAll(), { signal: ctx.signal }))
        .numbers as Types.Mutable<Output["getAll"]["numbers"]>;
    },
    onUpdate: async ({ transaction, collection }) => {
      const mutation = transaction.mutations[0];
      const response = await Effect.runPromise(
        getApiClient().numbers.update({ params: { id: mutation.key }, payload: mutation.changes }),
      );
      await collection.utils.writeUpsert(response);
    },
    onDelete: async ({ transaction, collection }) => {
      const mutation = transaction.mutations[0];
      const response = await Effect.runPromise(
        getApiClient().numbers.delete({ params: { id: mutation.key } }),
      );
      await collection.utils.writeDelete(response.id);
    },
  }),
);

export function getNumberQuery(dbClient: DbClient, numberId: IdBranded<"number">) {
  const numbersCollection = dbClient.collection(numbersCollectionOptions);
  return new Query()
    .from({ number: numbersCollection })
    .where(({ number }) => eq(number.id, numberId))
    .findOne();
}

export function getAllNumbersQuery(dbClient: DbClient) {
  const numbersCollection = dbClient.collection(numbersCollectionOptions);
  return new Query().from({ number: numbersCollection }).orderBy(({ number }) => number.createdAt);
}

export function useAddNumber() {
  const numbersCollection = useDbClient().collection(numbersCollectionOptions);

  return async (input: Input["create"]["payload"]) => {
    await Effect.runPromise(
      getApiClient()
        .numbers.create({ payload: input })
        .pipe(
          Effect.catchTag("MaxCountReached", (error) =>
            Effect.sync(() => {
              toastManager.add({
                title: m.example_maxNumberCountReached(),
                description: m.example_maxNumberCountReachedDescription({
                  maxCount: error.maxCount,
                }),
                type: "error",
              });
            }),
          ),
        ),
    );
    await numbersCollection.utils.refetch();
  };
}

export function useDeleteAllNumbers() {
  const numbersCollection = useDbClient().collection(numbersCollectionOptions);
  return createOptimisticAction<void>({
    onMutate: () => {
      const keys = [...numbersCollection.keys()];
      if (keys.length === 0) return;
      numbersCollection.delete(keys);
    },
    mutationFn: async () => {
      await Effect.runPromise(getApiClient().numbers.deleteAll());
      await numbersCollection.utils.refetch();
    },
  });
}
