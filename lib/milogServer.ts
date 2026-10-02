import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { ApiLoginResponse, ApiTimelineResponse, AuthSession, TimelineFilters, TimelinePage } from "@/lib/types";
import { normalizeTimelineResponse } from "@/lib/milogApi";
import { buildTimelineApiSearchParams } from "@/lib/timelineQuery";

const SESSION_COOKIE = "milog_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const LOGIN_PATH = "/api/v1/auth/login";
const REFRESH_PATH = "/api/v1/auth/refresh";
const SESSION_PATH = "/api/v1/auth/me";
const LOGOUT_PATH = "/api/v1/auth/logout";
const TIMELINE_PATH = "/api/v1/timeline";

export class MiLogServerError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: "configuration" | "unauthenticated" | "forbidden" | "validation" | "unavailable" | "upstream",
    public readonly details?: { tenants?: Array<{ id: string; name: string }> },
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
  const payload = await parseJson<{ message?: string; error?: { message?: string; tenants?: Array<{ id: string; name: string }> } }>(response);
  const message = payload?.error?.message ?? payload?.message ?? fallback;
  if (response.status === 401) return new MiLogServerError(message, 401, "unauthenticated");
  if (response.status === 403) return new MiLogServerError(message, 403, "forbidden");
  if (response.status === 400 || response.status === 422) return new MiLogServerError(message, response.status, "validation");
  if (response.status >= 500) return new MiLogServerError("MiLog API is temporarily unavailable.", 503, "unavailable");
  return new MiLogServerError(message, response.status, "upstream", { tenants: payload?.error?.tenants });
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
    if (!decoded.token || !decoded.refresh_token || !decoded.user?.id || !decoded.tenant?.id || !decoded.expires_at || !decoded.session_expires_at) return null;
    return Date.parse(decoded.session_expires_at) > Date.now() ? decoded : null;
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
  const expiresIn = Math.max(0, Math.min(SESSION_MAX_AGE_SECONDS, Math.floor((Date.parse(session.session_expires_at) - Date.now()) / 1000)));
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

function sessionFromTokenPayload(payload: ApiLoginResponse, sessionExpiresAt?: string): AuthSession {
  const token = payload.access_token;
  const refreshToken = payload.refresh_token;
  const apiUser = payload.user;
  const tenant = apiUser?.tenant;
  if (!token || !refreshToken || !apiUser?.id || !apiUser.email || !tenant?.id) {
    throw new MiLogServerError("MiLog authentication response was incomplete.", 502, "upstream");
  }
  const expiresIn = Math.max(payload.expires_in ?? 0, 60);
  return {
    token,
    refresh_token: refreshToken,
    user: { id: String(apiUser.id), name: apiUser.name ?? apiUser.email, email: apiUser.email, tenant_id: tenant.id },
    tenant: { id: tenant.id, name: tenant.name },
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    session_expires_at: sessionExpiresAt ?? new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString(),
  };
}

export async function loginServer(email: string, password: string, tenantId?: string): Promise<{ session: AuthSession }> {
  const { apiUrl } = requireConfig();
  let response: Response;
  try {
    response = await fetch(joinUrl(apiUrl, LOGIN_PATH), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password, ...(tenantId ? { tenant_id: tenantId } : {}) }),
      cache: "no-store",
    });
  } catch {
    throw new MiLogServerError("Unable to reach the MiLog API.", 503, "unavailable");
  }
  if (!response.ok) throw await upstreamError(response, "Invalid email or password.");
  const payload = await parseJson<ApiLoginResponse>(response);
  if (!payload) throw new MiLogServerError("MiLog authentication response was empty.", 502, "upstream");
  return { session: sessionFromTokenPayload(payload) };
}

export async function refreshSessionServer(session: AuthSession): Promise<AuthSession> {
  const { apiUrl } = requireConfig();
  let response: Response;
  try {
    response = await fetch(joinUrl(apiUrl, REFRESH_PATH), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
      cache: "no-store",
    });
  } catch {
    throw new MiLogServerError("Unable to refresh the MiLog session.", 503, "unavailable");
  }
  if (!response.ok) throw await upstreamError(response, "Your MiLog session has expired.");
  const payload = await parseJson<ApiLoginResponse>(response);
  if (!payload) throw new MiLogServerError("MiLog refresh response was empty.", 502, "upstream");
  const refreshed = sessionFromTokenPayload(payload, session.session_expires_at);
  if (refreshed.tenant.id !== session.tenant.id || refreshed.user.id !== session.user.id) {
    throw new MiLogServerError("Refreshed MiLog session changed identity or tenant.", 403, "forbidden");
  }
  return refreshed;
}

export async function validateSessionServer(session: AuthSession): Promise<AuthSession> {
  if (Date.parse(session.expires_at) <= Date.now() + 30_000) return refreshSessionServer(session);
  const { apiUrl } = requireConfig();
  let response: Response;
  try {
    response = await fetch(joinUrl(apiUrl, SESSION_PATH), {
      headers: { Authorization: `Bearer ${session.token}`, Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new MiLogServerError("Unable to verify the MiLog session.", 503, "unavailable");
  }
  if (!response.ok) throw await upstreamError(response, "Your MiLog session has expired or was revoked.");
  const payload = await parseJson<{ user?: ApiLoginResponse["user"]; expires_at?: string }>(response);
  const apiUser = payload?.user;
  if (!apiUser?.id || !apiUser.email || !apiUser.tenant?.id || apiUser.tenant.id !== session.tenant.id || String(apiUser.id) !== session.user.id) {
    throw new MiLogServerError("MiLog session identity or tenant could not be verified.", 403, "forbidden");
  }
  return {
    ...session,
    user: { id: String(apiUser.id), name: apiUser.name ?? apiUser.email, email: apiUser.email, tenant_id: apiUser.tenant.id },
    tenant: { id: apiUser.tenant.id, name: apiUser.tenant.name },
    expires_at: payload?.expires_at ?? session.expires_at,
  };
}

export async function logoutServer(session: AuthSession | null) {
  if (!session) return;
  const { apiUrl } = requireConfig();
  try {
    const response = await fetch(joinUrl(apiUrl, LOGOUT_PATH), {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok && response.status !== 401) throw await upstreamError(response, "Unable to revoke the MiLog session.");
  } catch (error) {
    if (error instanceof MiLogServerError) throw error;
    throw new MiLogServerError("Unable to reach the MiLog API during logout.", 503, "unavailable");
  }
}

export async function getTimelineServer(filters: TimelineFilters, session: AuthSession, cursor?: string): Promise<TimelinePage> {
  const { apiUrl } = requireConfig();
  const params = buildTimelineApiSearchParams(filters, cursor);
  let response: Response;
  try {
    response = await fetch(`${joinUrl(apiUrl, TIMELINE_PATH)}?${params.toString()}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${session.token}` },
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
