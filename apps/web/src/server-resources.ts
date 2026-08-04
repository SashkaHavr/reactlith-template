import { createAuth } from "@reactlith-template/auth";
import { createDB } from "@reactlith-template/db";

export const db = createDB();
export const auth = createAuth(db);

export async function dispose() {
  await db.$client.end();
}
