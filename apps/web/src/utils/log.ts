import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { Array, Predicate, Record, Result } from "effect";
import type { AuditableLogger } from "evlog";
import { initLog, log as clientLog } from "evlog/client";

export const logError = createIsomorphicFn()
  .server((error: unknown) => {
    getServerLog()?.set({ error: getErrorData(error) });
    if (Predicate.isError(error) || Predicate.isString(error)) {
      getServerLog()?.error(error);
    }
  })
  .client((error: unknown) => {
    clientLog.error({
      error: getErrorDataWithCause(error),
    });
  });

export const setupClientLog = createIsomorphicFn().client(() => {
  initLog({
    service: "web-browser",
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
    ? (request.context.log as AuditableLogger)
    : undefined;
}

function getErrorData(error: Error): Record<string, unknown>;
function getErrorData(error: unknown): unknown;
function getErrorData(error: unknown): unknown {
  if (Predicate.isError(error)) {
    const extraData = Record.fromEntries(
      Array.filterMap(
        ["status", "statusText", "statusCode", "statusMessage", "data", "code", "routerCode"],
        (key) =>
          Predicate.hasProperty(error, key)
            ? Result.succeed([key, error[key]] as const)
            : Result.failVoid,
      ),
    );
    return { name: error.name, message: error.message, stack: error.stack, ...extraData };
  }
  return error ?? {};
}

function getErrorDataWithCause(error: unknown): unknown {
  if (Predicate.isError(error)) {
    return {
      ...getErrorData(error),
      cause: error.cause !== undefined ? getErrorData(error.cause) : undefined,
    };
  }
  return error;
}
