// oxlint-disable import/no-default-export

import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import type { AuditableLogger } from "evlog";

import * as WideLog from "@reactlith-template/services/layers/wide-log";
import type { WideLogType } from "@reactlith-template/services/wide-log";

import { resources } from "./server-resources";

type RequestContext = typeof resources & {
  log: WideLogType;
};

declare module "@tanstack/react-router" {
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

    return handler.fetch(request, {
      context: { ...resources, log: logService },
    });
  },
});
