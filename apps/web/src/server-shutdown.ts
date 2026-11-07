// oxlint-disable import/no-default-export
// oxlint-disable no-restricted-imports
import { definePlugin } from "nitro";

import { api, runtime } from "~/server-resources";

export default definePlugin((nitro) => {
  nitro.hooks.hook("close", async () => {
    await runtime.dispose();
    await api.dispose();
  });
});
