// oxlint-disable import/no-default-export
import type { DrainContext } from "evlog";
import { log as simpleLog } from "evlog";
import { createUserAgentEnricher } from "evlog/enrichers";
import { defineHandler } from "nitro";

const enrich = createUserAgentEnricher();

export default defineHandler(async (event) => {
  const logEvent = (await event.req.json()) as DrainContext["event"];
  enrich({ event: logEvent, headers: Object.fromEntries(event.req.headers.entries()) });
  if (logEvent.level === "error") {
    simpleLog.error(logEvent);
  }
  return new Response(undefined, { status: 204 });
});
