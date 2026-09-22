import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimelineFeed } from "@/components/TimelineFeed";
import { ToastProvider } from "@/providers/toast-provider";
import type { TimelineEvent } from "@/lib/types";

const event: TimelineEvent = {
  id: "evt_1",
  tenant_id: "tenant_1",
  occurred_at: "2026-05-04T16:00:00Z",
  created_at: "2026-05-04T16:00:01Z",
  raw_log_level: "info",
  log_level: "info",
  actor: "Chris",
  actor_type: "user",
  actor_id: "user-42",
  action: "viewed",
  target_type: "page",
  target_id: "pricing",
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
    expect(screen.getByLabelText("Actor: user user-42")).toBeInTheDocument();
    expect(screen.getByLabelText("Action: viewed")).toBeInTheDocument();
    expect(screen.getByLabelText("Target: page pricing")).toBeInTheDocument();
    expect(screen.getByText("source")).toBeInTheDocument();
    expect(screen.getByText("google_ads")).toBeInTheDocument();
    expect(screen.getByText("status")).toBeInTheDocument();
  });

  it("selects a row when the event message is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ToastProvider>
        <TimelineFeed
          events={[event]}
          selectedEventId={undefined}
          onSelect={onSelect}
          visibleMetadataKeys={["source", "status"]}
        />
      </ToastProvider>,
    );

    await user.click(screen.getByText("Lead viewed pricing page"));

    expect(onSelect).toHaveBeenCalledWith(event);
  });
});
