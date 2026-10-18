import { createServer } from "node:http";

import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { HttpRouter } from "effect/http";

import { ApiConfig } from "#config";

import { App } from "./app";

const config = Effect.runSync(ApiConfig.make);

HttpRouter.serve(App, { disableLogger: true }).pipe(
  Layer.provide(NodeHttpServer.layer(createServer, { host: "0.0.0.0", port: config.port })),
  Layer.launch,
  NodeRuntime.runMain,
);
