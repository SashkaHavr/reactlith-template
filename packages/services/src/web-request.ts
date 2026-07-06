import { Context } from "effect";

export class WebRequest extends Context.Service<WebRequest, Request>()(
  "@reactlith-template/web-request",
) {}
