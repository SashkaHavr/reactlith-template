import { Schema, Struct } from "effect";

export function schemaCrudUpdate<T extends Schema.Struct.Fields>(schema: Schema.Struct<T>) {
  return schema
    .mapFields(Struct.map(Schema.optionalKey))
    .check(Schema.makeFilter((data) => Struct.keys(data).length > 0));
}
