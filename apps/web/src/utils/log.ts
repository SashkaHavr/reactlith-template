import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { initLog, log as clientLog } from "evlog/client";

import type { LogType } from "@reactlith-template/utils/log";

export const logError = createIsomorphicFn()
  .server((error: any) => {
    getServerLog()?.set({ error: getErrorData(error) });
    if (error instanceof Error || typeof error === "string") {
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
    service: "reactlith-template-web-frontend",
    transport: {
      enabled: true,
      endpoint: "/ingest",
    },
    minLevel: "error",
  });
  window.addEventListener("error", (e) => {
    logError(e.error);
  });
});

export const getServerLog = createIsomorphicFn().server(() => {
  return getRequestLog(getRequest());
});

export function getRequestLog(request: Request | undefined) {
  return (request as any)?.context?.log as LogType;
}

function getErrorData(error: unknown) {
  if (error instanceof Error) {
    const errorObj: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    const errRecord = error as unknown as Record<string, unknown>;
    for (const k of [
      "status",
      "statusText",
      "statusCode",
      "statusMessage",
      "data",
      "code",
      "routerCode",
    ] as const) {
      if (k in error) errorObj[k] = errRecord[k];
    }

    return errorObj;
  }
  return error ?? {};
}

function getErrorDataWithCause(error: unknown) {
  if (error instanceof Error) {
    return {
      ...getErrorData(error),
      cause: error.cause !== undefined ? getErrorData(error.cause) : undefined,
    };
  }
  return error;
}
