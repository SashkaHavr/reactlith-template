import { Schema } from "effect";

export const authOutput = Schema.toStandardSchemaV1(
  Schema.Struct({ google: Schema.Boolean, googleEmulate: Schema.Boolean }),
);
