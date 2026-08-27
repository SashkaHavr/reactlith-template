import type { Brand } from "effect";
import { Schema } from "effect";

import type { schema } from "#relations";

type BrandOf<T> = T extends Brand.Brand<string> ? Brand.Brand.Keys<T> : never;

type IdBrandOfTable<T> = T extends { $inferSelect: { id: infer Id } } ? BrandOf<Id> : never;

type AllIdBrands<S> = {
  [K in keyof S]: IdBrandOfTable<S[K]>;
}[keyof S];

export type SchemaIdBrands = AllIdBrands<typeof schema>;

export function IdBranded<T extends SchemaIdBrands>(brand: T) {
  return Schema.String.check(Schema.isUUID(7)).pipe(Schema.brand(brand), Schema.toType);
}

export type IdBranded<T extends SchemaIdBrands> = Brand.Branded<string, T>;
