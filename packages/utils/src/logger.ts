import type { RequestLogger } from "evlog";
import { identifyUser as identifyUserBase } from "evlog/better-auth";

export function getLogger(request: Request | undefined) {
  if (
    request !== undefined &&
    "context" in request &&
    request.context instanceof Object &&
    "log" in request.context
  ) {
    return request.context.log as RequestLogger;
  }
}

export function identifyUser(
  log: Parameters<typeof identifyUserBase>[0] | undefined,
  session: Parameters<typeof identifyUserBase>[1] | null,
) {
  if (log && session) {
    identifyUserBase(log, session, { session: false, fields: ["email", "role"] });
  }
}
