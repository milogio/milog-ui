const apiUrl = process.env.MILOG_API_URL;
const sessionSecret = process.env.MILOG_SESSION_SECRET;

if (!apiUrl) throw new Error("MiLog UI is missing MILOG_API_URL.");

let parsedApiUrl;
try {
  parsedApiUrl = new URL(apiUrl);
} catch {
  throw new Error("MILOG_API_URL must be an absolute HTTP or HTTPS URL.");
}

if (!['http:', 'https:'].includes(parsedApiUrl.protocol)) {
  throw new Error("MILOG_API_URL must use HTTP or HTTPS.");
}

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error("MiLog UI requires MILOG_SESSION_SECRET with at least 32 characters.");
}
