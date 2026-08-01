import z from "zod";

export const dateInput = z.codec(z.iso.datetime(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
});

export const dateOutput = z.invertCodec(dateInput);
