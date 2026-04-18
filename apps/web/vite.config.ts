import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import evlog from "evlog/nitro/v3";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rolldownOptions: {
      external: ["bun"],
    },
  },
  dev: {
    preTransformRequests: false,
  },
  server: {
    port: 3000,
    host: "127.0.0.1",
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro({
      preset: "bun",
      output: { dir: "dist" },
      compressPublicAssets: { brotli: true },
      experimental: {
        asyncContext: true,
        vite: {},
      },
      plugins: ["src/lib/evlog-plugin"],
      modules: [evlog()],
    }),
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
});
