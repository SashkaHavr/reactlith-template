// oxlint-disable import/no-default-export
// oxlint-disable no-restricted-imports
import { defineHandler } from "nitro";

import { api } from "~/server-resources";

export default defineHandler(async (event) => api.handler(event.req));
