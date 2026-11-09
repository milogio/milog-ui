import { readFileSync } from "node:fs";

describe("production deployment boundary", () => {
  it("pins the pulled image and limits the published port to loopback", () => {
    const compose = readFileSync("compose.production.yaml", "utf8");
    expect(compose).toContain("@sha256:${MILOG_UI_DIGEST:?");
    expect(compose).toContain('"127.0.0.1:3000:3000"');
    expect(compose).not.toMatch(/\bbuild:/);
    expect(compose).toContain("restart: unless-stopped");
  });

  it("keeps request URLs and credential headers out of Caddy access logs", () => {
    const caddy = readFileSync("deploy/Caddyfile.production.example", "utf8");
    expect(caddy).toContain("request>uri delete");
    expect(caddy).toContain("log_append path {http.request.uri.path}");
    expect(caddy).toContain("request>headers delete");
    expect(caddy).toContain("resp_headers delete");
    expect(caddy).not.toContain("log_credentials");
    expect(caddy).toContain("header_up X-Forwarded-For {remote_host}");
    expect(caddy).toContain("header_up -X-Forwarded-*");
  });
});
