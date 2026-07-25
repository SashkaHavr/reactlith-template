import { createFileRoute } from "@tanstack/react-router";

import { ingestClientError } from "~/utils/log";

export const Route = createFileRoute("/(api)/ingest")({
  server: {
    handlers: {
      ANY: async () => {
        await ingestClientError();
      },
    },
  },
});
