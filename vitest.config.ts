import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    target: "esnext",
    tsconfigRaw: {
      compilerOptions: {
        target: "esnext",
      },
    },
  },
  resolve: {
    alias: {
      bun: fileURLToPath(new URL("./vitest-bun.ts", import.meta.url)),
    },
  },
  test: {
    include: ["{apps,packages}/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    server: {
      deps: {
        inline: ["drizzle-orm"],
      },
    },
  },
});
