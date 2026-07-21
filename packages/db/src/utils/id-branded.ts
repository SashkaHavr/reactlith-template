import type { Brand } from "effect";
import { Schema } from "effect";

import type { schema } from "#/relations";

type BrandOf<T> = T extends Brand.Brand<string> ? Brand.Brand.Keys<T> : never;

type IdBrandOfTable<T> = T extends { $inferSelect: { id: infer Id } } ? BrandOf<Id> : never;

type AllIdBrands<S> = {
  [K in keyof S]: IdBrandOfTable<S[K]>;
}[keyof S];

export type IdBrand = AllIdBrands<typeof schema>;

export function idBranded<T extends IdBrand>(brand: T) {
  return Schema.String.check(Schema.isUUID(7)).pipe(Schema.brand(brand));
}

export type IdBrandedInternal<T extends string> = string & Brand.Brand<T>;
export type IdBranded<T extends IdBrand> = string & Brand.Brand<T>;
