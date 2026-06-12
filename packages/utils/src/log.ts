import type { AuditableLogger } from "evlog";
import { identifyUser as identifyUserBase } from "evlog/better-auth";

export function identifyUser(
  log: LogType | undefined,
  session: Parameters<typeof identifyUserBase>[1] | null,
) {
  if (log && session) {
    identifyUserBase(log as AuditableLogger, session, {
      session: false,
      fields: ["email", "role"],
    });
  }
}

export type LogType = Pick<AuditableLogger, "set" | "error" | "warn" | "audit">;
