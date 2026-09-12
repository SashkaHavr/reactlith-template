// oxlint-disable import/no-default-export no-restricted-imports
import { definePlugin } from "nitro";

import { dispose } from "./server-resources";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("close", async () => {
    await dispose();
  });
});
