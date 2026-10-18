import { spawn } from "node:child_process";
import { join } from "node:path";

import { defineConfig } from "vite-plus";

let serverStopped = Promise.resolve();

export default defineConfig({
  pack: {
    entry: ["src/server.ts"],
    platform: "node",
    format: "esm",
    target: "node26",
    sourcemap: true,
    deps: { alwaysBundle: [/.*/] },
    onSuccess: async ({ watch, outDir }, signal) => {
      if (watch === false) return;

      await serverStopped;
      if (signal.aborted) return;

      const server = spawn(process.execPath, ["--enable-source-maps", join(outDir, "server.mjs")], {
        stdio: "inherit",
      });
      const stop = () => {
        server.kill("SIGTERM");
      };
      signal.addEventListener("abort", stop, { once: true });
      server.once("error", (error) => console.error(error));
      serverStopped = new Promise<void>((resolve) => {
        server.once("close", () => {
          signal.removeEventListener("abort", stop);
          resolve();
        });
      });
    },
  },
});
