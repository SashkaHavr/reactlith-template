import { Context, Effect, Layer } from "effect";
import type { AuditableLogger } from "evlog";
import { identifyUser } from "evlog/better-auth";

import { WideLog } from "@reactlith-template/services/wide-log";

export class Evlog extends Context.Service<Evlog, AuditableLogger>()("@reactlith-template/evlog") {}

export function make(log: AuditableLogger) {
  return WideLog.of({
    set: log.set,
    error: log.error,
    audit: log.audit,
    fork: log.fork!,
    identifyUser: (session) => {
      if (session) {
        identifyUser(log, session, {
          session: false,
          fields: ["email", "role"],
        });
      }
    },
  });
}

export const layer = Layer.effect(
  WideLog,
  Effect.gen(function* () {
    const evlog = yield* Evlog;
    return make(evlog);
  }),
);
