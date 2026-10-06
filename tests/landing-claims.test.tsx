import { render, screen } from "@testing-library/react";
import { CodeSection } from "@/components/landing/CodeSection";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { TrustedBy } from "@/components/landing/TrustedBy";

describe("marketing claim guardrails", () => {
  it("discloses unpublished access terms without presenting invented plans", () => {
    render(<Pricing />);

    expect(screen.getByRole("heading", { name: "Public plans are not available yet." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
    expect(screen.queryByText("$9")).not.toBeInTheDocument();
    expect(screen.queryByText("Start free")).not.toBeInTheDocument();
    expect(screen.queryByText("Start 14-day trial")).not.toBeInTheDocument();
  });

  it("uses the checked-in public ingestion contract for the API example", () => {
    render(<CodeSection />);

    const example = screen.getByText(/curl "\$MILOG_API_URL\/api\/v1\/events"/);
    expect(example).toHaveTextContent("X-API-Key: $MILOG_API_KEY");
    expect(example).toHaveTextContent("X-Idempotency-Key: checkout-1001");
    expect(example).toHaveTextContent('"actor_type": "user"');
    expect(example).toHaveTextContent('"target_type": "checkout"');
    expect(example).not.toHaveTextContent("Authorization: Bearer");
  });

  it("presents implemented capabilities instead of customer or speculative feature claims", () => {
    render(
      <>
        <TrustedBy />
        <Features />
      </>,
    );

    expect(screen.getByText("structured events · exact filters · event details · CSV + JSON export")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Find the event that matters" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Carry the result forward" })).toBeInTheDocument();
    expect(screen.queryByText(/Trusted by engineering teams/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/MQL|anomaly detection|SDKs for every stack/i)).not.toBeInTheDocument();
  });
});
