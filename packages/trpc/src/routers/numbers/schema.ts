import z from "zod";

import { idBranded } from "@reactlith-template/db/id-branded";

const numberValue = z.int().min(0).max(100);

export const numberInput = z.object({ number: numberValue });
export const numberUpdateInput = numberInput
  .partial()
  .refine((data) => Object.keys(data).length > 0);
export const numberOutput = z.object({ id: idBranded("number"), number: numberValue });
