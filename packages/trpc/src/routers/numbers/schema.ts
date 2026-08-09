import * as z from "zod";

import { dateOutput } from "#/utils/codecs";
import { idBranded } from "@reactlith-template/db/id-branded";

const numberValue = z.int().min(0).max(100);

const numberInput = z.object({ number: numberValue });
const numberUpdateInput = numberInput.partial().refine((data) => Object.keys(data).length > 0);
const numberOutput = z.object({ id: idBranded("number"), number: numberValue });
const numberIdInput = z.object({ id: idBranded("number") });
const numberFullOutput = numberOutput.extend({ createdAt: dateOutput, updatedAt: dateOutput });

export const getAllOutput = z.object({ numbers: z.array(numberOutput) });
export const getByIdInput = numberIdInput;
export const getByIdOutput = numberFullOutput;
export const addNewInput = numberInput;
export const addNewOutput = numberOutput;
export const updateInput = z.object({ id: idBranded("number"), data: numberUpdateInput });
export const updateOutput = numberFullOutput;
export const deleteInput = numberIdInput;
export const deleteOutput = numberIdInput;
export const deleteAllOutput = z.null();
