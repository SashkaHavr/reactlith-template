import { ApiClient, atomParams } from "~/lib/atom";

export const configGeneralAtom = ApiClient.query("index", "configGeneral", atomParams({}));

export const healthAtom = ApiClient.query("index", "health", atomParams({}));
