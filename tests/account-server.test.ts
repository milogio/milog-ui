import { accountError, accountJson, createApiKeyServer, getEntitlementServer, listApiKeysServer, requireKeyManager, resendSignupServer, revokeApiKeyServer, signupServer } from "@/lib/accountServer";
import { POST as signupRoute } from "@/app/api/signup/route";
import { POST as verifyRoute } from "@/app/api/signup/verify/route";
import type { ApiSignupRequest } from "@/lib/apiContract";
import { MiLogServerError } from "@/lib/milogServer";
import type { AuthSession } from "@/lib/types";
import { approvedTermsUrl } from "@/lib/terms";

const session: AuthSession = {
  token: "account-bearer-secret",
  refresh_token: "refresh-secret",
  user: { id: "42", name: "Ada", email: "ada@example.com", tenant_id: "tenant-1" },
  tenant: { id: "tenant-1", name: "Acme", role: "owner" },
  expires_at: new Date(Date.now() + 60_000).toISOString(),
  session_expires_at: new Date(Date.now() + 3_600_000).toISOString(),
};

const signup: ApiSignupRequest = {
  name: "Ada", tenant_name: "Acme", email: "ada@example.com", password: "long-unique-password",
  password_confirmation: "long-unique-password", terms_accepted: true,
};

describe("account API boundary", () => {
  beforeEach(() => {
    process.env.MILOG_API_URL = "https://api.milog.test";
    process.env.MILOG_SESSION_SECRET = "test-session-secret-that-is-at-least-32-characters";
    process.env.MILOG_TERMS_URL = "https://milog.test/terms";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.MILOG_API_URL;
    delete process.env.MILOG_SESSION_SECRET;
    delete process.env.MILOG_TERMS_URL;
  });

  it("posts signup and resend without credentials or cache", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      new Response(JSON.stringify({ message: "Check your email." }), { status: 202 }),
    );
    await signupServer(signup);
    await resendSignupServer(signup.email);

    expect(fetchMock).toHaveBeenNthCalledWith(1, "https://api.milog.test/api/v1/signup", expect.objectContaining({
      method: "POST", body: JSON.stringify(signup), cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "https://api.milog.test/api/v1/signup/resend", expect.objectContaining({
      body: JSON.stringify({ email: signup.email }),
    }));
  });

  it("uses a bearer token for account reads and key creation and keeps the raw key separate", async () => {
    const metadata = { id: "key-1", name: "Production", key_prefix: "milog_abc", kind: "temporary", status: "active", created_at: "2026-10-08T00:00:00Z", expires_at: null, revoked_at: null, last_used_at: null };
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { state: "evaluation", can_create_temporary_key: true } })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ ...metadata, api_key: "must-not-leak" }] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: metadata, api_key: "milog_full-secret" }), { status: 201 }));

    expect((await getEntitlementServer(session)).state).toBe("evaluation");
    expect(await listApiKeysServer(session)).toEqual([metadata]);
    expect((await createApiKeyServer({ name: "Production", kind: "temporary", password: "step-up" }, session)).api_key).toBe("milog_full-secret");
    for (const [url, options] of fetchMock.mock.calls) {
      expect(url).toMatch(/^https:\/\/api\.milog\.test\/api\/v1\//);
      expect(options?.headers).toMatchObject({ Authorization: "Bearer account-bearer-secret", Accept: "application/json" });
      expect(options?.cache).toBe("no-store");
      expect(JSON.stringify(options)).not.toContain("X-API-Key");
    }
  });

  it("preserves field errors and retry timing from the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(JSON.stringify({
      message: "Validation failed.", errors: { email: ["Email is invalid."] },
    }), { status: 422 })).mockResolvedValueOnce(new Response(JSON.stringify({
      error: { code: "rate_limited", message: "Slow down." },
    }), { status: 429, headers: { "Retry-After": "30" } }));

    await expect(signupServer(signup)).rejects.toMatchObject({
      status: 422, details: { fieldErrors: { email: ["Email is invalid."] } },
    });
    await expect(resendSignupServer(signup.email)).rejects.toMatchObject({
      status: 429, details: { apiCode: "rate_limited", retryAfter: "30" },
    });
    const response = await accountError(new MiLogServerError("Slow down.", 429, "upstream", { retryAfter: "30" }));
    expect(response.headers.get("Retry-After")).toBe("30");
  });

  it("returns step-up failure without clearing the authenticated session", async () => {
    const error = new MiLogServerError("Wrong password.", 401, "unauthenticated", { apiCode: "invalid_credentials" });
    const response = await accountError(error);
    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ message: "Wrong password.", code: "invalid_credentials" });
  });

  it("gates signup on approved terms and always returns a generic 202", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Existing account" }), { status: 202 }),
    );
    const makeRequest = () => new Request("https://ui.milog.test/api/signup", { method: "POST", body: JSON.stringify(signup) });
    const response = await signupRoute(makeRequest());
    expect(response.status).toBe(202);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ message: "If this address can be used, check your email for the next step." });
    delete process.env.MILOG_TERMS_URL;
    const gated = await signupRoute(makeRequest());
    expect(gated.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("accepts the explicit same-origin legal route without approving it automatically", () => {
    delete process.env.MILOG_TERMS_URL;
    expect(approvedTermsUrl()).toBeNull();
    process.env.MILOG_TERMS_URL = "/terms";
    expect(approvedTermsUrl()).toBe("/terms");
    process.env.MILOG_TERMS_URL = "/privacy";
    expect(approvedTermsUrl()).toBeNull();
  });

  it("posts the verification token in JSON and preserves invalid-link state", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      error: { code: "invalid_verification", message: "The link expired." },
    }), { status: 422 }));
    const response = await verifyRoute(new Request("https://ui.milog.test/api/signup/verify", {
      method: "POST", body: JSON.stringify({ token: "private-token" }),
    }));
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ message: "The link expired.", code: "invalid_verification" });
    expect(fetchMock).toHaveBeenCalledWith("https://api.milog.test/api/v1/signup/verify", expect.objectContaining({
      body: JSON.stringify({ token: "private-token" }),
    }));
  });

  it("enforces manager role locally and treats revocation 204 as success", async () => {
    expect(() => requireKeyManager({ ...session, tenant: { ...session.tenant, role: "member" } })).toThrow("Only owners and admins");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await expect(revokeApiKeyServer("key-1", session)).resolves.toBeUndefined();
    expect(accountJson({ api_key: "shown-once" }, 201).headers.get("Cache-Control")).toBe("no-store");
  });
});
