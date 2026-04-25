import { defineConfig } from "oxlint";

import baseConfig from "../../oxlint.config";

export default defineConfig({
  extends: [baseConfig],
  rules: { "no-process-env": "off" },
});
