import type { ApiEntitlement, ApiKeyMetadata, ApiSignupRequest } from "@/lib/apiContract";

type ErrorPayload = { message?: string; code?: string; errors?: Record<string, string[]> };

export class AccountApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly errors?: Record<string, string[]>,
    public readonly retryAfter?: string,
  ) {
    super(message);
    this.name = "AccountApiError";
  }
}

async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => null) as (T & ErrorPayload) | null;
  if (!response.ok) {
    throw new AccountApiError(
      payload?.message ?? "Unable to complete the request.",
      response.status,
      payload?.code,
      payload?.errors,
      response.headers.get("Retry-After") ?? undefined,
    );
  }
  if (payload === null) throw new AccountApiError("MiLog returned an empty response.", 502);
  return payload as T;
}

export const signup = (input: ApiSignupRequest) => request<{ message: string }>("/api/signup", "POST", input);
export const resendVerification = (email: string) => request<{ message: string }>("/api/signup/resend", "POST", { email });
export const verifyEmail = (token: string) => request<{ message: string }>("/api/signup/verify", "POST", { token });
export const getEntitlement = async () => (await request<{ data: ApiEntitlement }>("/api/entitlement")).data;
export const listApiKeys = async () => (await request<{ data: ApiKeyMetadata[] }>("/api/api-keys")).data;
export const createApiKey = (name: string, password: string) => request<{ data: ApiKeyMetadata; api_key: string }>(
  "/api/api-keys", "POST", { name, kind: "temporary", password },
);
export const revokeApiKey = (id: string) => request<void>(`/api/api-keys/${encodeURIComponent(id)}`, "DELETE");
