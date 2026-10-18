import type { Brand } from "effect";
import { Schema } from "effect";

import type { schema } from "#relations";

type IdBrandOfTable<T> = T extends { $inferSelect: { id: Brand.Brand<infer B> } } ? B : never;

export type SchemaIdBrands = IdBrandOfTable<(typeof schema)[keyof typeof schema]>;

export type IdBrandInput<T extends SchemaIdBrands> = Parameters<typeof Schema.brand<T>>[0];

export function IdBranded<T extends SchemaIdBrands>(brand: IdBrandInput<T>) {
  return Schema.String.check(Schema.isUUID(7)).pipe(Schema.brand<T>(brand), Schema.toType);
}

export type IdBranded<T extends SchemaIdBrands> = Brand.Branded<string, T>;
