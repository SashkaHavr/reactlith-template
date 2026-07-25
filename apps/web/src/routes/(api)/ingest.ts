import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeader } from "@tanstack/react-start/server";
import type { DrainContext } from "evlog";
import { log as simpleLog } from "evlog";
import { createUserAgentEnricher } from "evlog/enrichers";

export const Route = createFileRoute("/(api)/ingest")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const logEvent = (await request.json()) as DrainContext["event"];
        const enrich = createUserAgentEnricher();
        const userAgent = getRequestHeader("user-agent") ?? "";
        if (logEvent.level === "error") {
          enrich({ event: logEvent, headers: { "user-agent": userAgent } });
          simpleLog.error(logEvent);
        }
        return new Response(undefined, {
          status: 204,
        });
      },
    },
  },
});
