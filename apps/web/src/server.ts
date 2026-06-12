import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { Effect, Layer } from "effect";
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/unstable/http";

import { createAuth } from "@reactlith-template/auth";
import type { AuthType } from "@reactlith-template/auth";
import { createDB } from "@reactlith-template/db";
import type { DBType } from "@reactlith-template/db";
import { ConfigNodeLive } from "@reactlith-template/service/live/config";
import { LogMiddlewareLive } from "@reactlith-template/service/live/log";
import { Log } from "@reactlith-template/service/log";
import { trpcHandler } from "@reactlith-template/trpc";
import type { LogType } from "@reactlith-template/utils/log";

const db = createDB();
const auth = createAuth(db);

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

const ServerLive = HttpRouter.addAll([
  HttpRouter.route(
    "*",
    "/api/*",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const webRequest = yield* HttpServerRequest.toWeb(request);
      const log = yield* Log;
      const response = yield* Effect.promise(async () =>
        trpcHandler({ request: webRequest, context: { db, auth, log: log } }),
      );
      return HttpServerResponse.fromWeb(response);
    }),
  ),
  HttpRouter.route(
    "*",
    "/auth/*",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const webRequest = yield* HttpServerRequest.toWeb(request);
      const log = yield* Log;
      (webRequest as Request & { log: LogType }).log = log;
      const response = yield* Effect.promise(async () => auth.handler(webRequest));
      return HttpServerResponse.fromWeb(response);
    }),
  ),
  HttpRouter.route(
    "*",
    "/*",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const webRequest = yield* HttpServerRequest.toWeb(request);
      const log = yield* Log;
      const response = yield* Effect.promise(async () =>
        handler.fetch(webRequest, { context: { db, auth, log } }),
      );
      return HttpServerResponse.fromWeb(response);
    }),
  ),
]).pipe(Layer.provide(LogMiddlewareLive({})), Layer.provide(ConfigNodeLive));

const effectWebFetch = HttpRouter.toWebHandler(ServerLive, { disableLogger: true });

// oxlint-disable-next-line import/no-default-export
export default createServerEntry({
  async fetch(request) {
    return effectWebFetch.handler(request);
  },
});
