import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { Predicate } from "effect";
import { initLog, log as clientLog } from "evlog/client";

import type { Evlog } from "@reactlith-template/services/structured-logger";

export const logError = createIsomorphicFn()
  .server((error: any) => {
    getServerLog()?.set({ error: getErrorData(error) });
    if (Predicate.isError(error) || Predicate.isString(error)) {
      getServerLog()?.error(error);
    }
  })
  .client((error: any) => {
    clientLog.error({
      error: getErrorDataWithCause(error),
    });
  });

export const setupClientLog = createIsomorphicFn().client(() => {
  initLog({
    service: "web-frontend",
    transport: {
      enabled: true,
      endpoint: "/api/ingest",
    },
    minLevel: "error",
  });
  window.addEventListener("error", (e) => {
    logError(e.error);
  });
});

export const getServerLog = createIsomorphicFn().server(() => {
  return getGlobalStartContext()?.log;
});

export function getRequestLog(request: Request) {
  return Predicate.hasProperty("context")(request) && Predicate.hasProperty("log")(request.context)
    ? (request.context.log as typeof Evlog.Service)
    : undefined;
}

function getErrorData(error: any) {
  if (Predicate.isError(error)) {
    const errorObj: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    for (const k of [
      "status",
      "statusText",
      "statusCode",
      "statusMessage",
      "data",
      "code",
      "routerCode",
    ] as const) {
      if (Predicate.hasProperty(k)(error)) {
        errorObj[k] = error[k];
      }
    }

    return errorObj;
  }
  return error ?? {};
}

function getErrorDataWithCause(error: Error | string) {
  if (Predicate.isError(error)) {
    return {
      ...getErrorData(error),
      cause: error.cause !== undefined ? getErrorData(error.cause) : undefined,
    };
  }
  return error;
}
