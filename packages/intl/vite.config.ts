import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src",
      outputStructure: "locale-modules",
      cookieName: "locale",
      strategy: ["cookie", "preferredLanguage", "url", "baseLocale"],
    }),
  ],
});
