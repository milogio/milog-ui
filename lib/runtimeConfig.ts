import "server-only";

export type MiLogRuntimeConfig = {
  apiUrl: string;
  sessionSecret: string;
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

  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error("MiLog UI requires MILOG_SESSION_SECRET with at least 32 characters.");
  }

  return {
    apiUrl: parsedApiUrl.toString().replace(/\/$/, ""),
    sessionSecret,
  };
}
