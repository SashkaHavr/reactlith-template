import { Context } from "effect";
import type { AuditableLogger } from "evlog";
import type { identifyUser } from "evlog/better-auth";

export class WideLog extends Context.Service<
  WideLog,
  {
    set: AuditableLogger["set"];
    error: AuditableLogger["error"];
    audit: AuditableLogger["audit"];
    fork: NonNullable<AuditableLogger["fork"]>;
    identifyUser: (session: Parameters<typeof identifyUser>[1] | null) => void;
  }
>()("services/WideLog") {}

export type WideLogType = typeof WideLog.Service;
