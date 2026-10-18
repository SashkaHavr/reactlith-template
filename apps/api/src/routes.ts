import { Effect, Layer } from "effect";
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/http";
import { HttpApiBuilder } from "effect/http-api";

import { ApiLive } from "#layer";
import { Api } from "@reactlith-template/api-contract";
import { BetterAuth } from "@reactlith-template/auth";

export const AuthRoutes = HttpRouter.use(
  Effect.fnUntraced(function* (router) {
    const auth = yield* BetterAuth;
    return yield* router.add(
      "*",
      "/api/auth/*",
      Effect.fnUntraced(function* (request) {
        const webRequest = yield* HttpServerRequest.toWeb(request).pipe(Effect.orDie);
        const response = yield* Effect.promise(async () => auth.handler(webRequest));
        return HttpServerResponse.fromWeb(response);
      }),
    );
  }),
);

export const ApiRoutes = Layer.mergeAll(
  HttpApiBuilder.layer(Api).pipe(Layer.provide(ApiLive)),
  AuthRoutes,
);
