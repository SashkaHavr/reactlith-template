import * as z from "zod";

import type * as schema from "../schema";

type BrandOf<T> = T extends { [z.core.$brand]: infer B } ? keyof B : never;

type IdBrandOfTable<T> = T extends { $inferSelect: { id: infer Id } } ? BrandOf<Id> : never;

type AllIdBrands<S> = {
  [K in keyof S]: IdBrandOfTable<S[K]>;
}[keyof S];

export type SchemaIdBrands = AllIdBrands<typeof schema>;

export function idBranded<T extends SchemaIdBrands>(brand: T) {
  return z.uuidv7().brand<T, "inout">(brand);
}

export type IdBranded<T extends SchemaIdBrands> = string & z.core.$brand<T>;
