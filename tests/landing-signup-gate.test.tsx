import { render, screen } from "@testing-library/react";
import Page from "@/app/page";

vi.mock("next/server", () => ({ connection: vi.fn().mockResolvedValue(undefined) }));

describe("marketing signup gate", () => {
  const originalTermsUrl = process.env.MILOG_TERMS_URL;

  afterEach(() => {
    if (originalTermsUrl === undefined) delete process.env.MILOG_TERMS_URL;
    else process.env.MILOG_TERMS_URL = originalTermsUrl;
  });

  it("offers account creation when the approved terms URL is configured", async () => {
    process.env.MILOG_TERMS_URL = "/terms";
    render(await Page());

    expect(screen.getAllByRole("link", { name: /create (your )?account/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Create your MiLog account." })).toBeInTheDocument();
  });

  it("keeps signup off the marketing page when the deployment gate is unset", async () => {
    delete process.env.MILOG_TERMS_URL;
    render(await Page());

    expect(screen.queryByRole("link", { name: /create (your )?account/i })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Public plans are not available yet." })).toBeInTheDocument();
  });
});
