import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["bun"],
    },
  },
  server: {
    port: 3000,
    host: "127.0.0.1",
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro({ preset: "bun", output: { dir: "dist" } }),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tsConfigPaths(),
  ],
});
