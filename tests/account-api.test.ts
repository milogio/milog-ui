import { AccountApiError, createApiKey, getEntitlement, revokeApiKey } from "@/lib/accountApi";
import { accountErrorMessage } from "@/lib/accountUi";

describe("browser account API normalization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends step-up credentials to the same-origin route without caching", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      data: { id: "key-1" }, api_key: "milog_once",
    }), { status: 201 }));
    expect((await createApiKey("Production", "current-password")).api_key).toBe("milog_once");
    expect(fetchMock).toHaveBeenCalledWith("/api/api-keys", expect.objectContaining({
      method: "POST", credentials: "include", cache: "no-store",
      body: JSON.stringify({ name: "Production", kind: "temporary", password: "current-password" }),
    }));
  });

  it("returns entitlement data and handles empty revocation responses", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { state: "evaluation" } })))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    expect((await getEntitlement()).state).toBe("evaluation");
    await expect(revokeApiKey("key-1")).resolves.toBeUndefined();
  });

  it("preserves validation and rate-limit guidance", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      message: "Slow down.", code: "rate_limited", errors: { name: ["Name is required."] },
    }), { status: 429, headers: { "Retry-After": "20" } }));
    let failure: unknown;
    try { await createApiKey("", "password"); } catch (error) { failure = error; }
    expect(failure).toMatchObject({ status: 429, code: "rate_limited", errors: { name: ["Name is required."] }, retryAfter: "20" });
    expect(accountErrorMessage(failure)).toBe("Too many requests. Try again in 20 seconds.");
    expect(failure).toBeInstanceOf(AccountApiError);
  });
});
