// oxlint-disable import/no-default-export

import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import { paraglideMiddleware } from "@reactlith-template/intl/server";
import type { LogType } from "@reactlith-template/utils/log";
import { getRequestLog } from "~/utils/log";

import { apiClient, apiHandler, resources, authClient } from "./server-resources";

type RequestContext = typeof resources & {
  log: LogType | undefined;
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

export default createServerEntry({
  async fetch(request) {
    const log = getRequestLog(request);
    return await paraglideMiddleware(request, async () =>
      handler.fetch(request, {
        context: { ...resources, apiClient, log, apiHandler, authClient },
      }),
    );
  },
});
