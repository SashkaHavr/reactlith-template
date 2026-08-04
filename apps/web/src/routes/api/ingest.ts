import { createFileRoute } from "@tanstack/react-router";
import type { DrainContext } from "evlog";
import { log as simpleLog } from "evlog";
import { createUserAgentEnricher } from "evlog/enrichers";

const enrich = createUserAgentEnricher();

export const Route = createFileRoute("/api/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const logEvent = (await request.json()) as DrainContext["event"];
        enrich({ event: logEvent, headers: request.headers.toJSON() });
        if (logEvent.level === "error") {
          simpleLog.error(logEvent);
        }
        return new Response(undefined, {
          status: 204,
        });
      },
    },
  },
});
