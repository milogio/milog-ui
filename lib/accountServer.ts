import "server-only";

import { NextResponse } from "next/server";
import type { ApiEntitlement, ApiKeyCreateRequest, ApiKeyMetadata, ApiSignupRequest } from "@/lib/apiContract";
import type { AuthSession } from "@/lib/types";
import { readRuntimeConfig } from "@/lib/runtimeConfig";
import { clearSession, MiLogServerError, readSession, upstreamError, validateSessionServer, writeSession } from "@/lib/milogServer";

const noStore = { "Cache-Control": "no-store" };

async function requestApi(path: string, method: string, body?: unknown, session?: AuthSession): Promise<unknown> {
  let apiUrl: string;
  try {
    apiUrl = readRuntimeConfig().apiUrl;
  } catch (error) {
    throw new MiLogServerError(error instanceof Error ? error.message : "MiLog UI configuration is invalid.", 503, "configuration");
  }

  let response: Response;
  try {
    response = await fetch(new URL(path, apiUrl).toString(), {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store",
    });
  } catch {
    throw new MiLogServerError("Unable to reach the MiLog API.", 503, "unavailable");
  }

  if (!response.ok) throw await upstreamError(response, "MiLog API request failed.");
  if (response.status === 204) return null;
  try {
    return await response.json();
  } catch {
    throw new MiLogServerError("MiLog API returned an invalid JSON response.", 502, "upstream");
  }
}

export function accountJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: noStore });
}

export async function accountBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await request.json();
    if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  } catch {
    // Return the same safe validation response for malformed and non-object JSON.
  }
  throw new MiLogServerError("A JSON object is required.", 400, "validation");
}

export async function accountError(error: unknown) {
  const failure = error instanceof MiLogServerError ? error : new MiLogServerError("Unable to complete the request.", 500, "upstream");
  if (failure.status === 401 && failure.details?.apiCode !== "invalid_credentials") await clearSession();
  return NextResponse.json(
    {
      message: failure.message,
      ...(failure.details?.apiCode ? { code: failure.details.apiCode } : {}),
      ...(failure.details?.fieldErrors ? { errors: failure.details.fieldErrors } : {}),
    },
    {
      status: failure.status,
      headers: {
        ...noStore,
        ...(failure.details?.retryAfter ? { "Retry-After": failure.details.retryAfter } : {}),
      },
    },
  );
}

export async function accountSession(): Promise<AuthSession> {
  const session = await readSession();
  if (!session) throw new MiLogServerError("Your session has expired. Please sign in again.", 401, "unauthenticated");
  const verified = await validateSessionServer(session);
  await writeSession(verified);
  return verified;
}

export function requireKeyManager(session: AuthSession) {
  if (session.tenant.role !== "owner" && session.tenant.role !== "admin") {
    throw new MiLogServerError("Only owners and admins can manage API keys.", 403, "forbidden", { apiCode: "forbidden" });
  }
}

export async function signupServer(input: ApiSignupRequest) {
  await requestApi("/api/v1/signup", "POST", input);
}

export async function resendSignupServer(email: string) {
  await requestApi("/api/v1/signup/resend", "POST", { email });
}

export async function verifySignupServer(token: string) {
  await requestApi("/api/v1/signup/verify", "POST", { token });
}

export async function getEntitlementServer(session: AuthSession): Promise<ApiEntitlement> {
  const payload = await requestApi("/api/v1/entitlement", "GET", undefined, session) as { data?: ApiEntitlement };
  if (!payload?.data?.state) throw new MiLogServerError("MiLog API returned an incomplete entitlement.", 502, "upstream");
  return payload.data;
}

function keyMetadata(input: ApiKeyMetadata): ApiKeyMetadata {
  if (!input || typeof input.id !== "string" || typeof input.key_prefix !== "string" || typeof input.name !== "string") {
    throw new MiLogServerError("MiLog API returned incomplete key metadata.", 502, "upstream");
  }
  return {
    id: input.id,
    name: input.name,
    key_prefix: input.key_prefix,
    kind: input.kind,
    status: input.status,
    created_at: input.created_at,
    expires_at: input.expires_at,
    revoked_at: input.revoked_at,
    last_used_at: input.last_used_at,
  };
}

export async function listApiKeysServer(session: AuthSession): Promise<ApiKeyMetadata[]> {
  const payload = await requestApi("/api/v1/api-keys", "GET", undefined, session) as { data?: ApiKeyMetadata[] };
  if (!Array.isArray(payload?.data)) throw new MiLogServerError("MiLog API returned an incomplete key list.", 502, "upstream");
  return payload.data.map(keyMetadata);
}

export async function createApiKeyServer(input: ApiKeyCreateRequest, session: AuthSession): Promise<{ data: ApiKeyMetadata; api_key: string }> {
  const payload = await requestApi("/api/v1/api-keys", "POST", input, session) as { data?: ApiKeyMetadata; api_key?: string };
  if (!payload?.data?.id || !payload.api_key) throw new MiLogServerError("MiLog API returned an incomplete key response.", 502, "upstream");
  return { data: keyMetadata(payload.data), api_key: payload.api_key };
}

export async function revokeApiKeyServer(id: string, session: AuthSession) {
  await requestApi(`/api/v1/api-keys/${encodeURIComponent(id)}`, "DELETE", undefined, session);
}
