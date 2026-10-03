const server = vi.hoisted(() => ({
  clearSession: vi.fn(),
  getTimelineServer: vi.fn(),
  loginServer: vi.fn(),
  logoutServer: vi.fn(),
  readSession: vi.fn(),
  validateSessionServer: vi.fn(),
  writeSession: vi.fn(),
}));

vi.mock("@/lib/milogServer", () => {
  class MiLogServerError extends Error {
    constructor(
      message: string,
      public readonly status: number,
      public readonly code: string,
      public readonly details?: { tenants?: Array<{ id: string; name: string }> },
    ) {
      super(message);
      this.name = "MiLogServerError";
    }
  }

  return { ...server, MiLogServerError };
});

import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as session } from "@/app/api/auth/session/route";
import { GET as timeline } from "@/app/api/timeline/route";
import { MiLogServerError } from "@/lib/milogServer";
import type { AuthSession } from "@/lib/types";

const activeSession: AuthSession = {
  token: "access-token",
  refresh_token: "refresh-token",
  user: { id: "user-1", name: "Chris", email: "chris@example.com", tenant_id: "tenant-1" },
  tenant: { id: "tenant-1", name: "Callender" },
  expires_at: "2026-10-03T20:00:00Z",
  session_expires_at: "2026-10-04T03:00:00Z",
};

describe("UI route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.readSession.mockResolvedValue(activeSession);
    server.validateSessionServer.mockResolvedValue(activeSession);
  });

  it("retains login conflict details so a tenant can be selected", async () => {
    server.loginServer.mockRejectedValue(
      new MiLogServerError("Choose a tenant.", 409, "upstream", {
        tenants: [{ id: "tenant-1", name: "Callender" }],
      }),
    );

    const response = await login(new Request("http://ui.test/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "chris@example.com", password: "password" }),
    }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      message: "Choose a tenant.",
      tenants: [{ id: "tenant-1", name: "Callender" }],
    });
  });

  it.each([
    [401, "Session revoked.", "unauthenticated"],
    [403, "Tenant membership is inactive.", "forbidden"],
    [422, "Actor ID is invalid.", "validation"],
    [503, "MiLog API is temporarily unavailable.", "unavailable"],
  ] as const)("retains timeline status %s and its useful message", async (status, message, code) => {
    server.getTimelineServer.mockRejectedValue(new MiLogServerError(message, status, code));

    const response = await timeline(new Request("http://ui.test/api/timeline?actor_id=user-42"));

    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual({ message });
    expect(server.getTimelineServer).toHaveBeenCalledWith({ actor_id: "user-42" }, activeSession, undefined);
    expect(server.clearSession).toHaveBeenCalledTimes(status === 401 ? 1 : 0);
  });

  it("rejects unauthenticated timeline requests without calling the API", async () => {
    server.readSession.mockResolvedValue(null);

    const response = await timeline(new Request("http://ui.test/api/timeline"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: "Unauthenticated" });
    expect(server.getTimelineServer).not.toHaveBeenCalled();
  });

  it("clears invalid sessions and preserves the upstream message", async () => {
    server.validateSessionServer.mockRejectedValue(
      new MiLogServerError("Your token was revoked.", 401, "unauthenticated"),
    );

    const response = await session();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: "Your token was revoked." });
    expect(server.clearSession).toHaveBeenCalledOnce();
  });

  it("always clears the local cookie even when upstream logout fails", async () => {
    server.logoutServer.mockRejectedValue(
      new MiLogServerError("Logout service unavailable.", 503, "unavailable"),
    );

    const response = await logout();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ message: "Logout service unavailable." });
    expect(server.clearSession).toHaveBeenCalledOnce();
  });
});
