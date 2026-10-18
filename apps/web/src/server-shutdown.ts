// oxlint-disable import/no-default-export
// oxlint-disable no-restricted-imports
import { definePlugin } from "nitro";

import { api } from "~/server-resources";

export default definePlugin((nitro) => {
  nitro.hooks.hook("close", api.dispose);
});
