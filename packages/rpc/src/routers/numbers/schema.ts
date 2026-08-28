import { Schema } from "effect";

import { IdBranded } from "@reactlith-template/db/id-branded";

const numberValue = Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 100 }));

const numberInput = Schema.Struct({ number: numberValue });
const numberUpdateInput = Schema.Struct({ number: Schema.optionalKey(numberValue) }).check(
  Schema.makeFilter((data) => Object.keys(data).length > 0),
);
const numberOutput = Schema.Struct({ id: IdBranded("number"), number: numberValue });
const numberIdInput = Schema.Struct({ id: IdBranded("number") });
const numberFullOutput = Schema.Struct({
  ...numberOutput.fields,
  createdAt: Schema.flip(Schema.DateFromString),
  updatedAt: Schema.flip(Schema.DateFromString),
});

export const getAllOutput = Schema.toStandardSchemaV1(
  Schema.Struct({ numbers: Schema.Array(numberOutput) }),
);
export const getCountAbove50Output = Schema.toStandardSchemaV1(
  Schema.Struct({ count: Schema.Natural }),
);
export const getByIdInput = Schema.toStandardSchemaV1(numberIdInput);
export const getByIdOutput = Schema.toStandardSchemaV1(numberFullOutput);
export const addNewInput = Schema.toStandardSchemaV1(numberInput);
export const addNewOutput = Schema.toStandardSchemaV1(numberOutput);
export const updateInput = Schema.toStandardSchemaV1(
  Schema.Struct({ id: IdBranded("number"), data: numberUpdateInput }),
);
export const updateOutput = Schema.toStandardSchemaV1(numberFullOutput);
export const deleteInput = Schema.toStandardSchemaV1(numberIdInput);
export const deleteOutput = Schema.toStandardSchemaV1(numberIdInput);
export const deleteAllOutput = Schema.toStandardSchemaV1(Schema.Null);
