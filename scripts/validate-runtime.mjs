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
if (parsedApiUrl.username || parsedApiUrl.password || parsedApiUrl.search || parsedApiUrl.hash || parsedApiUrl.pathname !== '/') {
  throw new Error('MILOG_API_URL must contain only an origin, without credentials, path, query, or fragment.');
}

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error("MiLog UI requires MILOG_SESSION_SECRET with at least 32 characters.");
}

if (process.env.NODE_ENV === 'production') {
  if (parsedApiUrl.protocol !== 'https:') throw new Error('Production MILOG_API_URL must use HTTPS.');
  let uiOrigin;
  try { uiOrigin = new URL(process.env.MILOG_UI_ORIGIN); } catch { throw new Error('Production MILOG_UI_ORIGIN must use HTTPS.'); }
  if (uiOrigin.protocol !== 'https:' || uiOrigin.username || uiOrigin.password || uiOrigin.pathname !== '/' || uiOrigin.search || uiOrigin.hash) {
    throw new Error('Production MILOG_UI_ORIGIN must contain only an HTTPS origin.');
  }
  const decodedSecret = Buffer.from(sessionSecret, 'base64');
  if (decodedSecret.length < 48 || decodedSecret.toString('base64') !== sessionSecret || new Set(decodedSecret).size < 12) {
    throw new Error('Production MILOG_SESSION_SECRET must be at least 48 random bytes encoded as base64.');
  }
}
