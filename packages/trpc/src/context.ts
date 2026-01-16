import { auth } from "@reactlith-template/auth";
import { db } from "@reactlith-template/db";

export function createContext({ request }: { request: Request }) {
  return { request, db, auth: auth.api };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
