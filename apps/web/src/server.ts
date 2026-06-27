// oxlint-disable import/no-default-export

import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import { createAuth } from "@reactlith-template/auth";
import type { AuthType } from "@reactlith-template/auth";
import { createDB } from "@reactlith-template/db";
import type { DBType } from "@reactlith-template/db";
import type { LogType } from "@reactlith-template/utils/log";

const db = createDB();
const auth = createAuth(db);

interface RequestContext {
  db: DBType;
  auth: AuthType;
  log: LogType;
}

declare module "@tanstack/react-router" {
  interface Register {
    server: {
      requestContext: RequestContext;
    };
  }
}

export default createServerEntry({
  async fetch(request) {
    return handler.fetch(request, {
      context: { db, auth, log: (request as any)["context"]["log"] as LogType },
    });
  },
});
