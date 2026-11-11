import { defineConfig } from "@x18n/core";

// Detected presets: paraglide. They apply automatically.
export default defineConfig({
  sourceLocale: "en",
  ignoreKeys: ["$schema"],
  strict: true,
  usage: {
    include: ["apps/web/**"],
  },
  extract: {
    templates: [
      {
        template: "{m.{key}({args})}",
        kinds: ["jsx-text"],
        imports: ['import { m } from "@reactlith-template/intl/messages";'],
      },
      {
        template: "m.{key}({args})",
        kinds: ["js-string", "js-template"],
        imports: ['import { m } from "@reactlith-template/intl/messages";'],
      },
    ],
  },
  resources: [
    {
      pattern: "packages/intl/messages/{locale}.{ext}",
    },
  ],
});
