// oxlint-disable import/no-default-export

import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import type { AuthType } from "@reactlith-template/auth";
import type { DBType } from "@reactlith-template/db";
import { paraglideMiddleware } from "@reactlith-template/intl/server";
import { getRequestLog } from "@reactlith-template/utils/log";
import type { LogType } from "@reactlith-template/utils/log";

import { auth, db } from "./server-resources";

interface RequestContext {
  db: DBType;
  auth: AuthType;
  log: LogType;
}

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
    await paraglideMiddleware(request, () => {});
    return handler.fetch(request, {
      context: { db, auth: auth, log },
    });
  },
});
