// oxlint-disable import/no-default-export

import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { createTRPCClient } from "@trpc/client";

import { paraglideMiddleware } from "@reactlith-template/intl/server";
import { createLocalLink } from "@reactlith-template/trpc";
import type { TRPCRouter } from "@reactlith-template/trpc";
import type { LogType } from "@reactlith-template/utils/log";
import { getRequestLog } from "~/utils/log";

import { resources } from "./server-resources";

type RequestContext = typeof resources & {
  log: LogType;
  rpc: ReturnType<typeof createTRPCClient<TRPCRouter>>;
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
    const rpc = createTRPCClient<TRPCRouter>({
      links: [createLocalLink({ request, context: { ...resources, log } })],
    });
    return await paraglideMiddleware(request, async () =>
      handler.fetch(request, {
        context: { ...resources, log, rpc },
      }),
    );
  },
});
