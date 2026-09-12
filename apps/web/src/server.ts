// oxlint-disable import/no-default-export no-restricted-imports

import { Readable } from "node:stream";
import { constants, createBrotliCompress, createGzip } from "node:zlib";

import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import { paraglideMiddleware } from "@reactlith-template/intl/server";
import type { Evlog } from "@reactlith-template/services/structured-logger";
import { getRequestLog } from "~/utils/log";

import { apiClient, apiHandler, resources, authClient } from "./server-resources";

type RequestContext = typeof resources & {
  log: typeof Evlog.Service | undefined;
  apiHandler: typeof apiHandler;
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
    const response = await paraglideMiddleware(request, async () =>
      handler.fetch(request, {
        context: { ...resources, apiClient, log, apiHandler, authClient },
      }),
    );
    return compressStream(request, response);
  },
});
