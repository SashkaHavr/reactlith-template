import { Context } from "effect";

export class WebRequest extends Context.Service<WebRequest, Request>()("services/WebRequest") {}
