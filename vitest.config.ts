import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: "./vitest.global-setup.ts",
    include: ["{apps,packages}/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    maxWorkers: "50%",
  },
});
