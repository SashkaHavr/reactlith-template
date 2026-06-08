import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { createRequestLogger, initLogger } from "evlog";
import { parseURL } from "ufo";

import { createAuth } from "@reactlith-template/auth";
import type { AuthType } from "@reactlith-template/auth";
import { createDB } from "@reactlith-template/db";
import type { DBType } from "@reactlith-template/db";
import { envNode } from "@reactlith-template/env/node";
import type { LogType } from "@reactlith-template/utils/logger";
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

initLogger({
  env: { service: "reactlith-template-web-backend", environment: envNode.NODE_ENV },
  sampling: {
    rates: {
      info: envNode.NODE_ENV === "development" ? 0 : 5,
      warn: 0,
      debug: 0,
      error: 100,
    },
    keep: [{ status: 400 }, { duration: 500 }],
  },
});

// oxlint-disable-next-line import/no-default-export
export default createServerEntry({
  async fetch(request) {
    const db = createDB();
    const auth = createAuth(db);
    const { pathname } = parseURL(request.url);
    const log = createRequestLogger({ method: request.method, path: pathname });

    const response = await handler.fetch(request, { context: { db, auth, log } });

    log.emit();
    await db.$client.close();

    return response;
  },
});
