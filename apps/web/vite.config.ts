import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import evlog from "evlog/nitro/v3";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro({
      preset: "bun",
      plugins: ["src/server-shutdown"],
      output: { dir: "dist" },
      compressPublicAssets: { brotli: true },
      experimental: {
        asyncContext: true,
      },
      modules: [
        evlog({
          env: { service: "reactlith-template-web-backend" },
          sampling: {
            rates: {
              info: 0,
              warn: 0,
              debug: 0,
              error: 100,
            },
            keep: [{ status: 400 }, { duration: 500 }],
          },
        }),
      ],
    }),
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
});
