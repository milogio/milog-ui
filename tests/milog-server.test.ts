import { decodeSession, encodeSession, getTimelineServer, loginServer, MiLogServerError, validateSessionServer } from "@/lib/milogServer";
import type { AuthSession } from "@/lib/types";

const secret = "test-session-secret-that-is-at-least-32-characters";

function session(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    token: "tenant-bound-secret-token",
    refresh_token: "rotating-refresh-token",
    user: { id: "user-42", name: "Chris", email: "chris@example.com", tenant_id: "tenant-1" },
    tenant: { id: "tenant-1", name: "SonicCode" },
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    session_expires_at: new Date(Date.now() + 60 * 60_000).toISOString(),
    ...overrides,
  };
}

describe("MiLog server authentication boundary", () => {
  beforeEach(() => {
    process.env.MILOG_API_URL = "https://api.milog.test";
    process.env.MILOG_SESSION_SECRET = secret;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.MILOG_API_URL;
    delete process.env.MILOG_SESSION_SECRET;
  });

  it("encrypts authenticated sessions and rejects tampered or expired cookies", () => {
    const activeSession = session();
    const value = encodeSession(activeSession, secret);

    expect(value).not.toContain("tenant-bound-secret-token");
    expect(decodeSession(value, secret)).toEqual(activeSession);
    expect(decodeSession(`${value.slice(0, -1)}x`, secret)).toBeNull();
    expect(decodeSession(encodeSession(session({ session_expires_at: "2020-01-01T00:00:00Z" }), secret), secret)).toBeNull();
  });

  it("uses the tenant-bound login endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      access_token: "token-1",
      refresh_token: "refresh-1",
      token_type: "Bearer",
      expires_in: 900,
      user: { id: 42, name: "Chris", email: "chris@example.com", tenant: { id: "tenant-1", name: "SonicCode", role: "admin" } },
    }), { status: 200 }));

    const result = await loginServer("chris@example.com", "correct-password");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("https://api.milog.test/api/v1/auth/login", expect.objectContaining({ method: "POST" }));
    expect(result.session.tenant.id).toBe("tenant-1");
    expect(result.session.expires_at).toBeTruthy();
  });

  it("rejects an incomplete tenant-bound response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ access_token: "token-1", refresh_token: "refresh-1", user: { id: 42 } }), { status: 200 }),
    );

    await expect(loginServer("chris@example.com", "correct-password")).rejects.toMatchObject({ status: 502 });
  });

  it("uses the tenant-bound bearer token and rejects cross-tenant events", async () => {
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
      expect.objectContaining({ headers: { Accept: "application/json", Authorization: "Bearer tenant-bound-secret-token" } }),
    );
  });

  it("rotates an expiring access and refresh token without changing identity", async () => {
    const expiring = session({ expires_at: new Date(Date.now() + 5_000).toISOString() });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      access_token: "token-2",
      refresh_token: "refresh-2",
      expires_in: 900,
      user: { id: "user-42", name: "Chris", email: "chris@example.com", tenant: { id: "tenant-1", name: "SonicCode", role: "admin" } },
    }), { status: 200 }));

    const refreshed = await validateSessionServer(expiring);

    expect(refreshed.token).toBe("token-2");
    expect(refreshed.refresh_token).toBe("refresh-2");
    expect(refreshed.session_expires_at).toBe(expiring.session_expires_at);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.milog.test/api/v1/auth/refresh",
      expect.objectContaining({ body: JSON.stringify({ refresh_token: "rotating-refresh-token" }) }),
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
