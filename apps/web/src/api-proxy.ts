// oxlint-disable import/no-default-export
import { Effect } from "effect";
import { defineHandler } from "nitro";
import { proxyRequest } from "nitro/h3";

import { ServerConfig } from "@reactlith-template/config/server";

const serverConfig = Effect.runSync(ServerConfig.make);

export default defineHandler(async (event) => {
  const target = new URL(event.req.url);
  target.protocol = serverConfig.apiInternalUrl.protocol;
  target.host = serverConfig.apiInternalUrl.host;
  target.port = serverConfig.apiInternalUrl.port;
  return await proxyRequest(event, target.href, {
    headers: {
      host: serverConfig.publicUrl.host,
      "x-forwarded-host": serverConfig.publicUrl.host,
      "x-forwarded-proto": serverConfig.publicUrl.protocol.slice(0, -1),
    },
  });
});
