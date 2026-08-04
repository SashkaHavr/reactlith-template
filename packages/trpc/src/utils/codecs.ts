import * as z from "zod";

export const dateInput = z.codec(z.int().min(0), z.date(), {
  decode: (millis) => new Date(millis),
  encode: (date) => date.getTime(),
});

export const dateOutput = z.invertCodec(dateInput);
