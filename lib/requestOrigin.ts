import "server-only";

import { MiLogServerError } from "@/lib/milogServer";
import { readRuntimeConfig } from "@/lib/runtimeConfig";

/** Browser mutations must come from the configured public UI origin, not proxy headers. */
export function assertSameOrigin(request: Request) {
  const uiOrigin = process.env.NODE_ENV === "production"
    ? readRuntimeConfig().uiOrigin
    : process.env.MILOG_UI_ORIGIN;
  if (uiOrigin && request.headers.get("origin") !== uiOrigin) {
    throw new MiLogServerError("Request origin is not allowed.", 403, "forbidden");
  }
}
