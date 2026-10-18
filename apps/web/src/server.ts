// oxlint-disable import/no-default-export no-restricted-imports

import { Readable } from "node:stream";
import { constants, createBrotliCompress, createGzip } from "node:zlib";

import { getRequest } from "@tanstack/react-start/server";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { Effect, Layer, Option } from "effect";
import { FetchHttpClient, HttpClient, Headers as HttpHeaders, HttpTraceContext } from "effect/http";
import { HttpApiClient } from "effect/http-api";

import { Api } from "@reactlith-template/api-contract";
import { createAuthClient } from "@reactlith-template/auth/client";
import { paraglideMiddleware } from "@reactlith-template/intl/server";
import type { Evlog } from "@reactlith-template/services/structured-logger";
import { WebConfig } from "~/config";
import { getRequestLog } from "~/utils/log";

const serverConfig = Effect.runSync(WebConfig.make);

function getSsrRequest(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) {
  const request = new Request(
    input instanceof Request ? input : new URL(input, serverConfig.publicUrl),
    init,
  );
  const url = new URL(request.url);
  url.protocol = serverConfig.apiInternalUrl.protocol;
  url.host = serverConfig.apiInternalUrl.host;
  url.port = serverConfig.apiInternalUrl.port;

  const headers = new Headers(getRequest().headers);
  request.headers.forEach((value, key) => headers.set(key, value));
  headers.set("host", serverConfig.publicUrl.host);
  headers.set("x-forwarded-host", serverConfig.publicUrl.host);
  headers.set("x-forwarded-proto", serverConfig.publicUrl.protocol.slice(0, -1));

  return new Request(url, new Request(request, { headers, redirect: "manual" }));
}

const ssrFetch: typeof fetch = async (input, init) => fetch(getSsrRequest(input, init));

const authClient = createAuthClient({
  baseURL: serverConfig.publicUrl.href,
  customFetchImpl: ssrFetch,
});

const apiClient = Effect.runSync(
  HttpApiClient.make(Api, { baseUrl: serverConfig.publicUrl }).pipe(
    Effect.provide(
      FetchHttpClient.layer.pipe(
        Layer.provide(Layer.succeed(FetchHttpClient.Fetch, ssrFetch)),
        Layer.provide(Layer.succeed(HttpClient.TracerPropagationEnabled, false)),
      ),
    ),
  ),
);

type RequestContext = {
  log: typeof Evlog.Service | undefined;
  apiClient: typeof apiClient;
  authClient: typeof authClient;
};

declare module "@tanstack/react-start" {
  interface Register {
    server: {
      requestContext: RequestContext;
    };
  }
}

function createCompressionTransform(encoding: "br" | "gzip") {
  switch (encoding) {
    case "br":
      return createBrotliCompress({ flush: constants.BROTLI_OPERATION_FLUSH });
    case "gzip":
      return createGzip({ flush: constants.Z_SYNC_FLUSH });
  }
}

function compressStream(request: Request, response: Response) {
  if (
    !response.body ||
    !response.headers.get("Content-Type")?.includes("text/html") ||
    response.status !== 200 ||
    request.method !== "GET"
  ) {
    return response;
  }
  const acceptEncoding = request.headers
    .get("Accept-Encoding")
    ?.split(",")
    .map((s) => s.trim());
  const encoding = acceptEncoding?.find((s) => s === "br" || s === "gzip");

  const headers = new Headers(response.headers);
  headers.append("Vary", "Accept-Encoding");
  if (!encoding) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  headers.set("Content-Encoding", encoding);
  return new Response(
    Readable.toWeb(
      Readable.fromWeb(response.body as never).pipe(createCompressionTransform(encoding)),
    ) as never,
    {
      status: response.status,
      statusText: response.statusText,
      headers,
    },
  );
}

export default createServerEntry({
  async fetch(request) {
    const log = getRequestLog(request);
    const requestId = request.headers.get("x-railway-request-id");
    const traceId = HttpTraceContext.fromHeaders(HttpHeaders.fromInput(request.headers)).pipe(
      Option.map((span) => span.traceId),
      Option.getOrUndefined,
    );
    log?.set({ requestId, traceId });
    const response = await paraglideMiddleware(request, async () =>
      handler.fetch(request, {
        context: { apiClient, log, authClient },
      }),
    );
    return compressStream(request, response);
  },
});
