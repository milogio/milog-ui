import { GET as healthCheck } from "@/app/api/health/route";
import { readRuntimeConfig } from "@/lib/runtimeConfig";

describe("deployment runtime configuration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.MILOG_API_URL;
    delete process.env.MILOG_SESSION_SECRET;
  });

  it("accepts server-only HTTP configuration and normalizes the API URL", () => {
    expect(readRuntimeConfig({
      MILOG_API_URL: "http://milog-nginx/",
      MILOG_SESSION_SECRET: "a-secure-runtime-secret-with-32-characters",
    })).toEqual({
      apiUrl: "http://milog-nginx",
      sessionSecret: "a-secure-runtime-secret-with-32-characters",
    });
  });

  it.each([
    [{ MILOG_SESSION_SECRET: "a-secure-runtime-secret-with-32-characters" }, "MILOG_API_URL"],
    [{ MILOG_API_URL: "milog-nginx", MILOG_SESSION_SECRET: "a-secure-runtime-secret-with-32-characters" }, "absolute HTTP or HTTPS"],
    [{ MILOG_API_URL: "ftp://milog-nginx", MILOG_SESSION_SECRET: "a-secure-runtime-secret-with-32-characters" }, "HTTP or HTTPS"],
    [{ MILOG_API_URL: "http://milog-nginx", MILOG_SESSION_SECRET: "short" }, "at least 32 characters"],
  ])("rejects invalid required configuration", (environment, message) => {
    expect(() => readRuntimeConfig(environment)).toThrow(message);
  });

  it("reports ready when configuration is valid and the API responds", async () => {
    process.env.MILOG_API_URL = "http://milog-nginx";
    process.env.MILOG_SESSION_SECRET = "a-secure-runtime-secret-with-32-characters";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 401 }));

    const response = await healthCheck();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "ok", checks: { api: "reachable" } });
  });

  it("reports unavailable without exposing secrets when configuration is invalid", async () => {
    const response = await healthCheck();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({ status: "unavailable", checks: { configuration: "invalid" } });
    expect(JSON.stringify(body)).not.toContain("sessionSecret");
  });
});
