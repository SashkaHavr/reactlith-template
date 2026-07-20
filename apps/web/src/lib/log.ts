import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { initLog, log } from "evlog/client";

import { getErrorData, getErrorDataWithCause } from "@reactlith-template/utils/error";

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
  });
  window.addEventListener("error", (e) => {
    logError(e.error);
  });
});

export const getServerLogger = createIsomorphicFn().server(() => {
  return getGlobalStartContext()?.log;
});
