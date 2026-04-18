import type evlog from "evlog/nitro/v3";
// oxlint-disable node/no-process-env
import { definePlugin } from "nitro";

function evlogRuntimeConfigPlugin() {
  const dev = process.env.NODE_ENV === "development";

  // evlog's Nitro v3 plugin reads this env bridge at runtime before falling
  // back to Nitro runtime config, which is not reachable in this bundled build.
  process.env.__EVLOG_CONFIG = JSON.stringify({
    env: { service: "reactlith-template-web-backend" },
    exclude: ["/.well-known/**", "/ingest"],
    sampling: {
      rates: {
        info: dev ? 0 : 5,
        warn: 0,
        debug: 0,
        error: 100,
      },
      keep: [{ status: 400 }, { duration: 500 }],
    },
  } satisfies Parameters<typeof evlog>[0]);
}

// oxlint-disable-next-line import/no-default-export
export default definePlugin(evlogRuntimeConfigPlugin);
