import "server-only";

import { cookies } from "next/headers";
import type {
  ApiLoginResponse,
  ApiTimelineResponse,
  AuthSession,
  MiLogTenant,
  MiLogUser,
  TimelineFilters,
  TimelinePage,
} from "@/lib/types";
import { normalizeTimelineResponse } from "@/lib/milogApi";

const API_URL = process.env.NEXT_PUBLIC_MILOG_API_URL ?? "https://api.milog.local";
const SESSION_COOKIE = "milog_session";
const LOGIN_PATHS = ["/auth/login", "/oauth/token"];
const TIMELINE_PATHS = ["/api/v1/timeline", "/v1/timeline"];

type LoginResult = {
  session: AuthSession;
};

function joinUrl(path: string) {
  return new URL(path, API_URL).toString();
}

async function parseJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text) as T;
}

function encodeSession(session: AuthSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSession(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AuthSession;
}

export async function readSession(): Promise<AuthSession | null> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    return decodeSession(cookie);
  } catch {
    return null;
  }
}

export async function writeSession(session: AuthSession) {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

async function fetchMe(token: string) {
  for (const path of ["/api/me", "/api/user"]) {
    const response = await fetch(joinUrl(path), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 404) continue;
    if (!response.ok) {
      throw new Error("Unable to load MiLog session.");
    }

    if (path === "/api/me") {
      const payload = (await parseJson<{ user: MiLogUser; tenant: MiLogTenant }>(response))!;
      return payload;
    }

    const userPayload = (await parseJson<Partial<MiLogUser>>(response))!;
    return {
      user: {
        id: String(userPayload.id ?? ""),
        name: userPayload.name ?? "Local User",
        email: userPayload.email ?? "",
        tenant_id: process.env.MILOG_LOCAL_TENANT_ID ?? "local-tenant",
      },
      tenant: {
        id: process.env.MILOG_LOCAL_TENANT_ID ?? "local-tenant",
        name: process.env.MILOG_LOCAL_TENANT_NAME ?? "Local Tenant",
      },
    };
  }

  throw new Error("Unable to load MiLog session.");
}

async function attemptLoginViaPasswordGrant(email: string, password: string) {
  const clientId = process.env.MILOG_PASSPORT_CLIENT_ID;
  const clientSecret = process.env.MILOG_PASSPORT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Passport client credentials are missing.");
  }

  const response = await fetch(joinUrl("/oauth/token"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      grant_type: "password",
      client_id: clientId,
      client_secret: clientSecret,
      username: email,
      password,
      scope: "",
    }),
  });

  if (!response.ok) {
    const payload = await parseJson<{ message?: string }>(response);
    throw new Error(payload?.message ?? "Invalid email or password.");
  }

  const payload = (await parseJson<ApiLoginResponse>(response))!;
  const token = payload.access_token;
  if (!token) throw new Error("MiLog login response did not include an access token.");

  const me = await fetchMe(token);
  return {
    session: {
      token,
      user: me.user,
      tenant: me.tenant,
    },
  } satisfies LoginResult;
}

export async function loginServer(email: string, password: string): Promise<LoginResult> {
  for (const path of LOGIN_PATHS) {
    try {
      const response = await fetch(joinUrl(path), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body:
          path === "/oauth/token"
            ? JSON.stringify({
                grant_type: "password",
                client_id: process.env.MILOG_PASSPORT_CLIENT_ID,
                client_secret: process.env.MILOG_PASSPORT_CLIENT_SECRET,
                username: email,
                password,
                scope: "",
              })
            : JSON.stringify({ email, password }),
      });

      if (response.status === 404) continue;
      if (!response.ok) {
        const payload = await parseJson<{ message?: string }>(response);
        throw new Error(payload?.message ?? "Invalid email or password.");
      }

      const payload = (await parseJson<ApiLoginResponse>(response))!;
      const token = payload.token ?? payload.access_token;
      if (!token) throw new Error("MiLog login response did not include a token.");

      const user = payload.user as MiLogUser | undefined;
      const tenant = payload.tenant;

      if (user && tenant) {
        return { session: { token, user, tenant } };
      }

      const me = await fetchMe(token);
      return {
        session: {
          token,
          user: me.user,
          tenant: me.tenant,
        },
      };
    } catch (error) {
      if (path === "/oauth/token") {
        return attemptLoginViaPasswordGrant(email, password);
      }

      if (error instanceof Error && error.message.includes("fetch")) continue;
      throw error;
    }
  }

  return attemptLoginViaPasswordGrant(email, password);
}

export async function getTimelineServer(filters: TimelineFilters, token: string): Promise<TimelinePage> {
  const params = new URLSearchParams();
  if (filters.start_date) params.set("start_date", filters.start_date);
  if (filters.end_date) params.set("end_date", filters.end_date);
  if (filters.actor) params.set("actor", filters.actor);
  if (filters.message) params.set("message", filters.message);
  if (filters.metadata_key) params.set("metadata_key", filters.metadata_key);
  if (filters.metadata_value) params.set("metadata_value", filters.metadata_value);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.log_level?.length) params.set("log_level", filters.log_level.join(","));
  if (filters.cursor) params.set("cursor", filters.cursor);
  if (filters.cursor && /^\d+$/.test(filters.cursor)) params.set("page", filters.cursor);

  let lastError: Error | null = null;

  for (const path of TIMELINE_PATHS) {
    try {
      const apiKey = process.env.MILOG_TIMELINE_API_KEY;
      const response = await fetch(`${joinUrl(path)}?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          ...(apiKey ? { "X-API-Key": apiKey } : { Authorization: `Bearer ${token}` }),
        },
        cache: "no-store",
      });

      if (response.status === 404) continue;
      if (response.status === 401) throw new Error("Unauthorized");
      if (!response.ok) {
        const payload = await parseJson<{ message?: string }>(response);
        throw new Error(payload?.message ?? "Unable to load MiLog timeline.");
      }

      const payload = (await parseJson<ApiTimelineResponse>(response))!;
      return normalizeTimelineResponse(payload, filters.cursor);
    } catch (error) {
      lastError = error as Error;
    }
  }

  throw lastError ?? new Error("Unable to load MiLog timeline.");
}
