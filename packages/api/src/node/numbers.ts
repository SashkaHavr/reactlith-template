import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { Api } from "#/index";
import { NumberRepoForUser } from "@reactlith-template/repositories/numbers";

export const NumbersApiHandlers = HttpApiBuilder.group(Api, "numbers", (handlers) =>
  Effect.gen(function* () {
    return handlers
      .handle("getAll", () =>
        Effect.gen(function* () {
          const numbers = yield* NumberRepoForUser;
          return yield* numbers.getAll();
        }),
      )
      .handle("get", ({ params }) =>
        Effect.gen(function* () {
          const numbers = yield* NumberRepoForUser;
          return yield* numbers.get({ id: params.id });
        }),
      )
      .handle("add", ({ payload }) =>
        Effect.gen(function* () {
          const numbers = yield* NumberRepoForUser;
          return yield* numbers.add({ number: payload.number });
        }),
      )
      .handle("update", ({ params, payload }) =>
        Effect.gen(function* () {
          const numbers = yield* NumberRepoForUser;
          return yield* numbers.update({
            id: params.id,
            data: { number: payload.number },
          });
        }),
      )
      .handle("delete", ({ params }) =>
        Effect.gen(function* () {
          const numbers = yield* NumberRepoForUser;
          return yield* numbers.delete({ id: params.id });
        }),
      )
      .handle("deleteAll", () =>
        Effect.gen(function* () {
          const numbers = yield* NumberRepoForUser;
          return yield* numbers.deleteAll();
        }),
      );
  }),
);
