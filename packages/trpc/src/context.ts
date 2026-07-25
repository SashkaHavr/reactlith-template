import type { AuthType } from "@reactlith-template/auth";
import type { DBType } from "@reactlith-template/db";
import type { LogType } from "@reactlith-template/utils/log";

export function createContext({
  request,
  context,
}: {
  request: Request;
  context: { db: DBType; auth: AuthType; log?: LogType };
}) {
  return { request, db: context.db, auth: context.auth.api, log: context.log };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
export type ContextParam = Parameters<typeof createContext>[0];
