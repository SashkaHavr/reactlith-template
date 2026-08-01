import z from "zod";

export const authOutput = z.object({ google: z.boolean(), googleEmulate: z.boolean() });
