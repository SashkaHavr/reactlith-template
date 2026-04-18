import { auth } from "@reactlith-template/auth";
import { db } from "@reactlith-template/db";
import { getLogger } from "@reactlith-template/utils/logger";
export function createContext({ request }: { request: Request }) {
  return { request, db, auth: auth.api, log: getLogger(request) };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
