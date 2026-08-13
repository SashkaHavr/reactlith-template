import { createAuth } from "@reactlith-template/auth";
import { createDB } from "@reactlith-template/db";

const db = createDB();
const auth = createAuth(db);

export async function dispose() {
  await db.$client.end();
}

export const resources = { db, auth };
