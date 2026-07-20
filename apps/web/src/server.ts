// oxlint-disable import/no-default-export

import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { Context } from "effect";
import type { AuditableLogger } from "evlog";

import { paraglideMiddleware } from "@reactlith-template/intl/server";
import * as WideLog from "@reactlith-template/services/layers/wide-log";
import { WideLog as WideLogService } from "@reactlith-template/services/wide-log";
import type { WideLogType } from "@reactlith-template/services/wide-log";

import { resources } from "./server-resources";

type RequestContext = typeof resources & {
  log: WideLogType;
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
    const log = (request as any)["context"]["log"] as AuditableLogger;
    const logService = WideLog.make(log);
    const apiHandler = async (request: Request) =>
      resources.apiHandler(request, Context.make(WideLogService, logService));

    return paraglideMiddleware(request, async () =>
      handler.fetch(request, {
        context: { ...resources, apiHandler, log: logService },
      }),
    );
  },
});
