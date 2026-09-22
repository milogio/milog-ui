import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { ApiLoginResponse, ApiTimelineResponse, AuthSession, MiLogUser, TimelineFilters, TimelinePage } from "@/lib/types";
import { normalizeTimelineResponse } from "@/lib/milogApi";
import { buildTimelineApiSearchParams } from "@/lib/timelineQuery";

const SESSION_COOKIE = "milog_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const LOGIN_PATH = "/oauth/token";
const SESSION_PATH = "/api/user";
const TIMELINE_PATH = "/api/v1/timeline";

export class MiLogServerError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: "configuration" | "unauthenticated" | "forbidden" | "validation" | "unavailable" | "upstream",
  ) {
    super(message);
    this.name = "MiLogServerError";
  }
}

function requireConfig() {
  const apiUrl = process.env.MILOG_API_URL;
  const sessionSecret = process.env.MILOG_SESSION_SECRET;
  if (!apiUrl) throw new MiLogServerError("MiLog UI is missing MILOG_API_URL.", 503, "configuration");
  try {
    new URL(apiUrl);
  } catch {
    throw new MiLogServerError("MILOG_API_URL must be an absolute URL.", 503, "configuration");
  }
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new MiLogServerError("MiLog UI requires MILOG_SESSION_SECRET with at least 32 characters.", 503, "configuration");
  }
  return { apiUrl, sessionSecret };
}

function requirePassportConfig() {
  const clientId = process.env.MILOG_PASSPORT_CLIENT_ID;
  const clientSecret = process.env.MILOG_PASSPORT_CLIENT_SECRET;
  const timelineApiKey = process.env.MILOG_TIMELINE_API_KEY;
  const tenantId = process.env.MILOG_LOCAL_TENANT_ID;
  const tenantName = process.env.MILOG_LOCAL_TENANT_NAME;
  if (!clientId || !clientSecret) {
    throw new MiLogServerError("MiLog UI requires MILOG_PASSPORT_CLIENT_ID and MILOG_PASSPORT_CLIENT_SECRET for the current API.", 503, "configuration");
  }
  if (!timelineApiKey || !tenantId || !tenantName) {
    throw new MiLogServerError("MiLog UI requires its tenant API key, tenant ID, and tenant name for the current API.", 503, "configuration");
  }
  return { clientId, clientSecret, timelineApiKey, tenant: { id: tenantId, name: tenantName } };
}

function joinUrl(apiUrl: string, path: string) {
  return new URL(path, apiUrl).toString();
}

async function parseJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new MiLogServerError("MiLog API returned an invalid JSON response.", 502, "upstream");
  }
}

async function upstreamError(response: Response, fallback: string): Promise<MiLogServerError> {
  const payload = await parseJson<{ message?: string }>(response);
  const message = payload?.message ?? fallback;
  if (response.status === 401) return new MiLogServerError(message, 401, "unauthenticated");
  if (response.status === 403) return new MiLogServerError(message, 403, "forbidden");
  if (response.status === 400 || response.status === 422) return new MiLogServerError(message, response.status, "validation");
  if (response.status >= 500) return new MiLogServerError("MiLog API is temporarily unavailable.", 503, "unavailable");
  return new MiLogServerError(message, response.status, "upstream");
}

function sessionKey(secret: string) {
  return createHash("sha256").update(secret).digest();
}

export function encodeSession(session: AuthSession, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", sessionKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(session), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function decodeSession(value: string, secret: string): AuthSession | null {
  try {
    const payload = Buffer.from(value, "base64url");
    if (payload.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", sessionKey(secret), payload.subarray(0, 12));
    decipher.setAuthTag(payload.subarray(12, 28));
    const decoded = JSON.parse(Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString("utf8")) as AuthSession;
    if (!decoded.token || !decoded.user?.id || !decoded.tenant?.id || !decoded.expires_at) return null;
    return Date.parse(decoded.expires_at) > Date.now() ? decoded : null;
  } catch {
    return null;
  }
}

export async function readSession(): Promise<AuthSession | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  const { sessionSecret } = requireConfig();
  return decodeSession(cookie, sessionSecret);
}

export async function writeSession(session: AuthSession) {
  const { sessionSecret } = requireConfig();
  const expiresIn = Math.max(0, Math.min(SESSION_MAX_AGE_SECONDS, Math.floor((Date.parse(session.expires_at) - Date.now()) / 1000)));
  (await cookies()).set(SESSION_COOKIE, encodeSession(session, sessionSecret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: expiresIn,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function loginServer(email: string, password: string): Promise<{ session: AuthSession }> {
  const { apiUrl } = requireConfig();
  const passport = requirePassportConfig();
  let response: Response;
  try {
    response = await fetch(joinUrl(apiUrl, LOGIN_PATH), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        grant_type: "password",
        client_id: passport.clientId,
        client_secret: passport.clientSecret,
        username: email,
        password,
        scope: "",
      }),
      cache: "no-store",
    });
  } catch {
    throw new MiLogServerError("Unable to reach the MiLog API.", 503, "unavailable");
  }
  if (!response.ok) throw await upstreamError(response, "Invalid email or password.");
  const payload = await parseJson<ApiLoginResponse>(response);
  const token = payload?.access_token;
  if (!token) throw new MiLogServerError("MiLog OAuth response did not include an access token.", 502, "upstream");
  const identityResponse = await fetch(joinUrl(apiUrl, SESSION_PATH), {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!identityResponse.ok) throw await upstreamError(identityResponse, "Unable to load the authenticated user.");
  const identity = await parseJson<Partial<MiLogUser>>(identityResponse);
  if (!identity?.id || !identity.email) throw new MiLogServerError("MiLog user response was incomplete.", 502, "upstream");
  const user: MiLogUser = { id: String(identity.id), name: identity.name ?? identity.email, email: identity.email, tenant_id: passport.tenant.id };
  const tenant = passport.tenant;
  const expiresIn = Math.min(Math.max(payload?.expires_in ?? SESSION_MAX_AGE_SECONDS, 60), SESSION_MAX_AGE_SECONDS);
  return { session: { token, user, tenant, expires_at: new Date(Date.now() + expiresIn * 1000).toISOString() } };
}

export async function validateSessionServer(session: AuthSession): Promise<AuthSession> {
  const { apiUrl } = requireConfig();
  const { tenant } = requirePassportConfig();
  let response: Response;
  try {
    response = await fetch(joinUrl(apiUrl, SESSION_PATH), {
      headers: { Authorization: `Bearer ${session.token}`, Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new MiLogServerError("Unable to verify the MiLog session.", 503, "unavailable");
  }
  if (!response.ok) throw await upstreamError(response, "Your MiLog session has expired.");
  const payload = await parseJson<Partial<MiLogUser>>(response);
  if (!payload?.id || !payload.email || tenant.id !== session.tenant.id) {
    throw new MiLogServerError("MiLog session identity could not be verified.", 403, "forbidden");
  }
  return {
    ...session,
    user: { id: String(payload.id), name: payload.name ?? payload.email, email: payload.email, tenant_id: tenant.id },
    tenant,
  };
}

export async function logoutServer(session: AuthSession | null) {
  // The current Passport API exposes no token-revocation route. The encrypted
  // UI session is still cleared immediately; upstream revocation remains an API dependency.
  void session;
}

export async function getTimelineServer(filters: TimelineFilters, session: AuthSession, cursor?: string): Promise<TimelinePage> {
  const { apiUrl } = requireConfig();
  const { timelineApiKey } = requirePassportConfig();
  const params = buildTimelineApiSearchParams(filters, cursor);
  let response: Response;
  try {
    response = await fetch(`${joinUrl(apiUrl, TIMELINE_PATH)}?${params.toString()}`, {
      headers: { Accept: "application/json", "X-API-Key": timelineApiKey },
      cache: "no-store",
    });
  } catch {
    throw new MiLogServerError("Unable to reach the MiLog API.", 503, "unavailable");
  }
  if (!response.ok) throw await upstreamError(response, "Unable to load MiLog timeline.");
  const payload = await parseJson<ApiTimelineResponse>(response);
  if (!payload) throw new MiLogServerError("MiLog API returned an empty timeline response.", 502, "upstream");
  const page = normalizeTimelineResponse(payload);
  if (page.events.some((event) => event.tenant_id !== session.tenant.id)) {
    throw new MiLogServerError("MiLog API returned timeline data for another tenant.", 403, "forbidden");
  }
  return page;
}
