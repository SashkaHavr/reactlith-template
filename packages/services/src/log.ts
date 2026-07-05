import { Context } from "effect";
import type { AuditableLogger } from "evlog";

type LogService = AuditableLogger & {
  identifyUser: (session: {
    session: Record<string, unknown>;
    user: Record<string, unknown>;
  }) => void;
};

export class Log extends Context.Service<Log, LogService>()("@reactlith-template/log") {}
