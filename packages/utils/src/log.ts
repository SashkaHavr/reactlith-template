import type { AuditableLogger } from "evlog";
import { identifyUser as identifyUserBase } from "evlog/better-auth";

export function identifyUser(
  log: Parameters<typeof identifyUserBase>[0] | undefined,
  session: Parameters<typeof identifyUserBase>[1] | null,
) {
  if (log && session) {
    identifyUserBase(log, session, { session: false, fields: ["email", "role"] });
  }
}

export type LogType = AuditableLogger;
