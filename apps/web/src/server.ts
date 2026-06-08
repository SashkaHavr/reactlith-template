import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { Effect, Layer, Logger, Schema } from "effect";
import {
  HttpRouter,
  HttpServer,
  HttpServerRequest,
  HttpServerResponse,
} from "effect/unstable/http";
import { RequestParseError } from "effect/unstable/http/HttpServerError";
import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiError,
  HttpApiGroup,
  HttpApiScalar,
} from "effect/unstable/httpapi";
import { createRequestLogger, initLogger } from "evlog";
import { parseURL } from "ufo";

import { createAuth } from "@reactlith-template/auth";
import type { AuthType } from "@reactlith-template/auth";
import { createDB } from "@reactlith-template/db";
import type { DBType } from "@reactlith-template/db";
import { envNode } from "@reactlith-template/env/node";
import { trpcHandler } from "@reactlith-template/trpc";
import type { LogType } from "@reactlith-template/utils/logger";

const db = createDB();
const auth = createAuth(db);
// const { pathname } = parseURL(request.url);

function createLoggerEffect(request: Request) {
  return Effect.gen(function* () {
    const { pathname } = parseURL(request.url);
    const log = createRequestLogger({ method: request.method, path: pathname });
    yield* Effect.addFinalizer(() => Effect.sync(() => log.emit()));
    return log;
  });
}

const Api = HttpApi.make("Web").add(
  HttpApiGroup.make("Main")
    .add(HttpApiEndpoint.get("api-get", "/api/*", { error: [HttpApiError.BadRequest] }))
    .add(HttpApiEndpoint.post("api-post", "/api/*", { error: [HttpApiError.BadRequest] }))
    .add(HttpApiEndpoint.get("auth-get", "/auth/*", { error: [HttpApiError.BadRequest] }))
    .add(HttpApiEndpoint.post("auth-post", "/auth/*", { error: [HttpApiError.BadRequest] }))
    .add(HttpApiEndpoint.get("app-get", "*", { error: [HttpApiError.BadRequest] }))
    .add(HttpApiEndpoint.post("app-post", "*", { error: [HttpApiError.BadRequest] })),
);

const GroupLive = HttpApiBuilder.group(Api, "Main", (handlers) =>
  handlers
    .handle("api-get", () =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;
        const webRequest = yield* HttpServerRequest.toWeb(request).pipe(
          Effect.catch(() => Effect.fail(new HttpApiError.BadRequest())),
        );
        const log = yield* createLoggerEffect(webRequest);
        const response = yield* Effect.promise(async () =>
          trpcHandler({ request: webRequest, context: { db, auth, log } }),
        );
        return HttpServerResponse.fromWeb(response);
      }),
    )
    .handle("api-post", () =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;
        const webRequest = yield* HttpServerRequest.toWeb(request).pipe(
          Effect.catch(() => Effect.fail(new HttpApiError.BadRequest())),
        );
        const log = yield* createLoggerEffect(webRequest);
        const response = yield* Effect.promise(async () =>
          trpcHandler({ request: webRequest, context: { db, auth, log } }),
        );
        return HttpServerResponse.fromWeb(response);
      }),
    )
    .handle("auth-get", () =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;
        const webRequest = yield* HttpServerRequest.toWeb(request).pipe(
          Effect.catch(() => Effect.fail(new HttpApiError.BadRequest())),
        );
        const response = yield* Effect.promise(async () => auth.handler(webRequest));
        return HttpServerResponse.fromWeb(response);
      }),
    )
    .handle("auth-post", () =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;
        const webRequest = yield* HttpServerRequest.toWeb(request).pipe(
          Effect.catch(() => Effect.fail(new HttpApiError.BadRequest())),
        );
        const response = yield* Effect.promise(async () => auth.handler(webRequest));
        return HttpServerResponse.fromWeb(response);
      }),
    )
    .handle("app-get", () =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;
        const webRequest = yield* HttpServerRequest.toWeb(request).pipe(
          Effect.catch(() => Effect.fail(new HttpApiError.BadRequest())),
        );
        const log = yield* createLoggerEffect(webRequest);
        const response = yield* Effect.promise(async () =>
          handler.fetch(webRequest, { context: { db, auth, log } }),
        );
        return HttpServerResponse.fromWeb(response);
      }),
    )
    .handle("app-post", () =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;
        const webRequest = yield* HttpServerRequest.toWeb(request).pipe(
          Effect.catch(() => Effect.fail(new HttpApiError.BadRequest())),
        );
        const log = yield* createLoggerEffect(webRequest);
        const response = yield* Effect.promise(async () =>
          handler.fetch(webRequest, { context: { db, auth, log } }),
        );
        return HttpServerResponse.fromWeb(response);
      }),
    ),
);

const ApiLive = HttpApiBuilder.layer(Api).pipe(
  Layer.provide(GroupLive),
  Layer.provide(HttpApiScalar.layer(Api)),
  Layer.provide(HttpServer.layerServices),
);

const effectHTTP = HttpRouter.toWebHandler(
  Layer.mergeAll(ApiLive, Logger.layer([Logger.consoleJson])),
);

interface RequestContext {
  db: DBType;
  auth: AuthType;
  log: LogType;
}

declare module "@tanstack/react-router" {
  interface Register {
    server: {
      requestContext: RequestContext;
    };
  }
}

initLogger({
  env: { service: "reactlith-template-web-backend", environment: envNode.NODE_ENV },
  sampling: {
    rates: {
      info: envNode.NODE_ENV === "development" ? 0 : 5,
      warn: 0,
      debug: 0,
      error: 100,
    },
    keep: [{ status: 400 }, { duration: 500 }],
  },
});

// oxlint-disable-next-line import/no-default-export
export default createServerEntry({
  async fetch(request) {
    return effectHTTP.handler(request);
  },
});
