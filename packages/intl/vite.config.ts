import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { defineConfig, lazyPlugins } from "vite-plus";

export default defineConfig({
  plugins: lazyPlugins(() => [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src",
      outputStructure: "locale-modules",
      cookieName: "locale",
      strategy: ["cookie", "preferredLanguage", "url", "baseLocale"],
      routeStrategies: [{ match: "/api/:path(.*)?", exclude: true }],
    }),
  ]),
});
