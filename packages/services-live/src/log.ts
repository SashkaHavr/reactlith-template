import { Layer } from "effect";
import type { AuditableLogger } from "evlog";

import { Log } from "@reactlith-template/services/log";
import { identifyUser } from "@reactlith-template/utils/log";

export function makeLogLive(log: AuditableLogger) {
  Object.assign(log, { identifyUser });
  Layer.sync(Log, () => ({ ...log, identifyUser: (session) => identifyUser(log, session) }));
}
