import { render, screen } from "@testing-library/react";
import { TimelineFeed } from "@/components/TimelineFeed";
import { ToastProvider } from "@/providers/toast-provider";
import type { TimelineEvent } from "@/lib/types";

const event: TimelineEvent = {
  id: "evt_1",
  tenant_id: "tenant_1",
  occurrence_date: "2026-05-04T16:00:00Z",
  log_level: "info",
  actor: "Chris",
  message: "Lead viewed pricing page",
  metadata: { source: "google_ads", status: "engaged" },
};

describe("TimelineFeed", () => {
  it("renders an empty state with no events", () => {
    render(
      <ToastProvider>
        <TimelineFeed events={[]} onSelect={() => undefined} visibleMetadataKeys={["source"]} />
      </ToastProvider>,
    );

    expect(screen.getByText("No events match this query")).toBeInTheDocument();
  });

  it("renders timeline events and metadata chips", () => {
    render(
      <ToastProvider>
        <TimelineFeed
          events={[event]}
          selectedEventId="evt_1"
          onSelect={() => undefined}
          visibleMetadataKeys={["source", "status"]}
        />
      </ToastProvider>,
    );

    expect(screen.getByText("Lead viewed pricing page")).toBeInTheDocument();
    expect(screen.getByText("source")).toBeInTheDocument();
    expect(screen.getByText("google_ads")).toBeInTheDocument();
    expect(screen.getByText("status")).toBeInTheDocument();
  });
});
