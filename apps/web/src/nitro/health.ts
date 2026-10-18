// oxlint-disable import/no-default-export
import { defineHandler } from "nitro";

export default defineHandler(() => new Response(undefined, { status: 200 }));
