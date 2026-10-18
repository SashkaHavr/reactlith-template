import { HttpRouter } from "effect/http";

import { App } from "@reactlith-template/api/src/app.ts";

export const api = HttpRouter.toWebHandler(App, { disableLogger: true });
