import { GET as healthCheck } from "@/app/api/health/route";
import { readRuntimeConfig } from "@/lib/runtimeConfig";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";

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

  it("requires HTTPS origins and a strong persistent secret in production", () => {
    const valid = {
      NODE_ENV: "production",
      MILOG_API_URL: "https://api.milog.ca",
      MILOG_UI_ORIGIN: "https://ui.example.com",
      MILOG_SESSION_SECRET: randomBytes(48).toString("base64"),
    };
    expect(readRuntimeConfig(valid)).toMatchObject({ apiUrl: valid.MILOG_API_URL, uiOrigin: valid.MILOG_UI_ORIGIN });
    expect(() => readRuntimeConfig({ ...valid, MILOG_API_URL: "http://api.milog.ca" })).toThrow("must use HTTPS");
    expect(() => readRuntimeConfig({ ...valid, MILOG_API_URL: "https://api.milog.ca/?token=secret" })).toThrow("only an origin");
    expect(() => readRuntimeConfig({ ...valid, MILOG_UI_ORIGIN: "http://ui.example.com" })).toThrow("must use HTTPS");
    expect(() => readRuntimeConfig({ ...valid, MILOG_SESSION_SECRET: "placeholder-secret-that-is-32-characters" })).toThrow("48 random bytes");
  });

  it("applies the same production checks before the standalone server starts", () => {
    const environment = { ...process.env, NODE_ENV: "production" as const, MILOG_API_URL: "https://api.milog.ca", MILOG_UI_ORIGIN: "https://ui.example.com", MILOG_SESSION_SECRET: randomBytes(48).toString("base64") };
    const accepted = spawnSync(process.execPath, ["scripts/validate-runtime.mjs"], {
      cwd: process.cwd(),
      env: environment,
      encoding: "utf8",
    });
    expect(accepted.status).toBe(0);
    expect(accepted.stdout).not.toContain(environment.MILOG_SESSION_SECRET);
    const result = spawnSync(process.execPath, ["scripts/validate-runtime.mjs"], {
      cwd: process.cwd(),
      env: { ...environment, MILOG_API_URL: "http://api.milog.ca" },
      encoding: "utf8",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Production MILOG_API_URL must use HTTPS");
  });
});
