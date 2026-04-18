import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { RequestLogger } from "evlog";
import { initLog, log } from "evlog/client";

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

export const logError = createIsomorphicFn()
  .server((error: any) => {
    getServerLogger()?.set({ error: getErrorData(error) });
    if (error instanceof Error) {
      getServerLogger()?.error(error);
    }
  })
  .client((error: any) => {
    log.error({
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

export const getServerLogger = createIsomorphicFn().server(() => {
  // @ts-expect-error Types are not defined but logger is there
  // oxlint-disable-next-line typescript/no-unsafe-member-access
  return getRequest().context.log as RequestLogger | undefined;
});
