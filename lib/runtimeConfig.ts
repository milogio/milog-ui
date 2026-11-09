import "server-only";

export type MiLogRuntimeConfig = {
  apiUrl: string;
  sessionSecret: string;
  uiOrigin?: string;
};

export function readRuntimeConfig(environment: Record<string, string | undefined> = process.env): MiLogRuntimeConfig {
  const apiUrl = environment.MILOG_API_URL;
  const sessionSecret = environment.MILOG_SESSION_SECRET;

  if (!apiUrl) throw new Error("MiLog UI is missing MILOG_API_URL.");

  let parsedApiUrl: URL;
  try {
    parsedApiUrl = new URL(apiUrl);
  } catch {
    throw new Error("MILOG_API_URL must be an absolute HTTP or HTTPS URL.");
  }
  if (!(["http:", "https:"] as string[]).includes(parsedApiUrl.protocol)) {
    throw new Error("MILOG_API_URL must use HTTP or HTTPS.");
  }
  if (parsedApiUrl.username || parsedApiUrl.password || parsedApiUrl.search || parsedApiUrl.hash || parsedApiUrl.pathname !== "/") {
    throw new Error("MILOG_API_URL must contain only an origin, without credentials, path, query, or fragment.");
  }

  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error("MiLog UI requires MILOG_SESSION_SECRET with at least 32 characters.");
  }

  let uiOrigin: string | undefined;
  if (environment.MILOG_UI_ORIGIN) {
    let parsedUiOrigin: URL;
    try {
      parsedUiOrigin = new URL(environment.MILOG_UI_ORIGIN);
    } catch {
      throw new Error("MILOG_UI_ORIGIN must be an absolute origin URL.");
    }
    if (parsedUiOrigin.username || parsedUiOrigin.password || parsedUiOrigin.pathname !== "/" || parsedUiOrigin.search || parsedUiOrigin.hash ||
        !(["http:", "https:"] as string[]).includes(parsedUiOrigin.protocol)) {
      throw new Error("MILOG_UI_ORIGIN must contain only an HTTP or HTTPS origin.");
    }
    uiOrigin = parsedUiOrigin.origin;
  }

  if (environment.NODE_ENV === "production") {
    if (parsedApiUrl.protocol !== "https:") throw new Error("Production MILOG_API_URL must use HTTPS.");
    if (!uiOrigin || !uiOrigin.startsWith("https://")) throw new Error("Production MILOG_UI_ORIGIN must use HTTPS.");
    const decodedSecret = Buffer.from(sessionSecret, "base64");
    if (decodedSecret.length < 48 || decodedSecret.toString("base64") !== sessionSecret || new Set(decodedSecret).size < 12) {
      throw new Error("Production MILOG_SESSION_SECRET must be at least 48 random bytes encoded as base64.");
    }
  }

  return {
    apiUrl: parsedApiUrl.toString().replace(/\/$/, ""),
    sessionSecret,
    ...(uiOrigin ? { uiOrigin } : {}),
  };
}
