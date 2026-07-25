import { createFileRoute } from "@tanstack/react-router";

import { ingestClientError } from "@reactlith-template/utils/log";

export const Route = createFileRoute("/(api)/ingest")({
  server: {
    handlers: {
      ANY: async () => {
        await ingestClientError();
      },
    },
  },
});
