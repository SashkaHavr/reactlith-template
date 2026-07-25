import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import { getAppContext } from "#/async-context/app";
import { getUserContext } from "#/async-context/user";
import { schema } from "@reactlith-template/db";
import type { IdBranded } from "@reactlith-template/db/id-branded";

function getDependencies() {
  const { db } = getAppContext();
  const { userId } = getUserContext();

  return { db, userId };
}

async function getAll() {
  const { db, userId } = getDependencies();
  return await db.query.number.findMany({
    columns: { id: true, number: true },
    where: { userId: { eq: userId } },
    orderBy: { createdAt: "asc" },
  });
}

async function getCount() {
  const { db, userId } = getDependencies();
  return await db.$count(schema.number, eq(schema.number.userId, userId));
}

async function getById(id: IdBranded<"number">) {
  const { db, userId } = getDependencies();
  const number = await db.query.number.findFirst({
    columns: { id: true, number: true },
    where: { id: { eq: id }, userId: { eq: userId } },
  });

  if (!number) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Number not found" });
  }

  return number;
}

async function addNew(value: number) {
  const { db, userId } = getDependencies();
  const [number] = await db
    .insert(schema.number)
    .values({ userId: userId, number: value })
    .returning({ id: schema.number.id, number: schema.number.number });

  if (!number) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add number" });
  }

  return number;
}

async function update(id: IdBranded<"number">, value: number) {
  const { db, userId } = getDependencies();
  const [number] = await db
    .update(schema.number)
    .set({ number: value })
    .where(and(eq(schema.number.id, id), eq(schema.number.userId, userId)))
    .returning({ id: schema.number.id, number: schema.number.number });

  if (!number) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Number not found" });
  }

  return number;
}

async function deleteById(id: IdBranded<"number">) {
  const { db, userId } = getDependencies();
  const [number] = await db
    .delete(schema.number)
    .where(and(eq(schema.number.id, id), eq(schema.number.userId, userId)))
    .returning({ id: schema.number.id });

  if (!number) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Number not found" });
  }

  return number;
}

async function deleteAll() {
  const { db, userId } = getDependencies();
  await db.delete(schema.number).where(eq(schema.number.userId, userId));
}

export const numberRepo = {
  getAll,
  getById,
  getCount,
  addNew,
  update,
  deleteById,
  deleteAll,
};
