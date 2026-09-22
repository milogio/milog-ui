import { decodeSession, encodeSession, getTimelineServer, loginServer, MiLogServerError } from "@/lib/milogServer";
import type { AuthSession } from "@/lib/types";

const secret = "test-session-secret-that-is-at-least-32-characters";

function session(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    token: "tenant-bound-secret-token",
    user: { id: "user-42", name: "Chris", email: "chris@example.com", tenant_id: "tenant-1" },
    tenant: { id: "tenant-1", name: "SonicCode" },
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    ...overrides,
  };
}

describe("MiLog server authentication boundary", () => {
  beforeEach(() => {
    process.env.MILOG_API_URL = "https://api.milog.test";
    process.env.MILOG_SESSION_SECRET = secret;
    process.env.MILOG_PASSPORT_CLIENT_ID = "passport-client";
    process.env.MILOG_PASSPORT_CLIENT_SECRET = "passport-secret";
    process.env.MILOG_TIMELINE_API_KEY = "tenant-api-key";
    process.env.MILOG_LOCAL_TENANT_ID = "tenant-1";
    process.env.MILOG_LOCAL_TENANT_NAME = "SonicCode";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.MILOG_API_URL;
    delete process.env.MILOG_SESSION_SECRET;
    delete process.env.MILOG_PASSPORT_CLIENT_ID;
    delete process.env.MILOG_PASSPORT_CLIENT_SECRET;
    delete process.env.MILOG_TIMELINE_API_KEY;
    delete process.env.MILOG_LOCAL_TENANT_ID;
    delete process.env.MILOG_LOCAL_TENANT_NAME;
  });

  it("encrypts authenticated sessions and rejects tampered or expired cookies", () => {
    const activeSession = session();
    const value = encodeSession(activeSession, secret);

    expect(value).not.toContain("tenant-bound-secret-token");
    expect(decodeSession(value, secret)).toEqual(activeSession);
    expect(decodeSession(`${value.slice(0, -1)}x`, secret)).toBeNull();
    expect(decodeSession(encodeSession(session({ expires_at: "2020-01-01T00:00:00Z" }), secret), secret)).toBeNull();
  });

  it("uses the API's explicit Passport and user endpoints", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token-1", expires_in: 3600 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "user-42", name: "Chris", email: "chris@example.com" }), { status: 200 }));

    const result = await loginServer("chris@example.com", "correct-password");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(1, "https://api.milog.test/oauth/token", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "https://api.milog.test/api/user", expect.any(Object));
    expect(result.session.tenant.id).toBe("tenant-1");
    expect(result.session.expires_at).toBeTruthy();
  });

  it("rejects an incomplete authenticated user response", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token-1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "user-42" }), { status: 200 }));

    await expect(loginServer("chris@example.com", "correct-password")).rejects.toMatchObject({ status: 502 });
  });

  it("uses the configured tenant API key and rejects cross-tenant events", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        data: [{
          id: "evt-1",
          tenant_id: "tenant-2",
          occurred_at: "2026-09-22T12:00:00Z",
          log_level: "info",
          message: "Wrong tenant",
        }],
      }), { status: 200 }),
    );

    await expect(getTimelineServer({}, session())).rejects.toMatchObject({ status: 403, code: "forbidden" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.milog.test/api/v1/timeline?pagination=cursor",
      expect.objectContaining({ headers: { Accept: "application/json", "X-API-Key": "tenant-api-key" } }),
    );
  });

  it("maps upstream authentication and availability failures", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Credential revoked." }), { status: 401 }),
    );
    await expect(getTimelineServer({}, session())).rejects.toEqual(
      expect.objectContaining<Partial<MiLogServerError>>({ status: 401, code: "unauthenticated", message: "Credential revoked." }),
    );

    vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 503 }));
    await expect(getTimelineServer({}, session())).rejects.toMatchObject({ status: 503, code: "unavailable" });
  });
});
