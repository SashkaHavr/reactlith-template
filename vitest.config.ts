import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    mockReset: true,
    projects: [
      {
        test: {
          name: "unit",
          include: ["{apps,packages}/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
          exclude: [...defaultExclude, "{apps,packages}/**/repo.{test,spec}.?(c|m)[jt]s?(x)"],
        },
      },
      {
        test: {
          name: "repo",
          maxWorkers: "50%",
          sequence: { groupOrder: 1 },
          globalSetup: "./vitest.db-setup.ts",
          include: ["{apps,packages}/**/repo.{test,spec}.?(c|m)[jt]s?(x)"],
        },
      },
    ],
  },
});
