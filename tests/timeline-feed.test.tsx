import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimelineFeed } from "@/components/TimelineFeed";
import { ToastProvider } from "@/providers/toast-provider";
import type { TimelineEvent } from "@/lib/types";
import { formatExactTimestamp } from "@/lib/utils";

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
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    const exactTime = screen.getByText(formatExactTimestamp(event.occurred_at));
    expect(exactTime.closest("time")).toHaveAttribute("datetime", event.occurred_at);
    expect(exactTime.closest("time")).not.toHaveAttribute("title");
    expect(screen.getByRole("button", { name: new RegExp(formatExactTimestamp(event.occurred_at)) })).toBeInTheDocument();
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

  it("persists compact and comfortable density choices", async () => {
    const user = userEvent.setup();
    const renderFeed = () => render(
      <ToastProvider>
        <TimelineFeed events={[event]} onSelect={() => undefined} visibleMetadataKeys={["source"]} />
      </ToastProvider>,
    );
    const firstRender = renderFeed();

    expect(screen.getByRole("button", { name: "Comfortable" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Compact" }));
    expect(screen.getByRole("button", { name: "Compact" })).toHaveAttribute("aria-pressed", "true");
    expect(window.localStorage.getItem("milog.timeline-density")).toBe("compact");

    firstRender.unmount();
    renderFeed();
    expect(screen.getByRole("button", { name: "Compact" })).toHaveAttribute("aria-pressed", "true");
  });

  it("only suppresses a message that exactly repeats the complete event context", () => {
    const redundantMessage = "user user-42 viewed page pricing";
    render(
      <ToastProvider>
        <TimelineFeed
          events={[
            { ...event, id: "evt_redundant", message: redundantMessage },
            { ...event, id: "evt_meaningful", message: "Lead viewed pricing page after opening a campaign email" },
          ]}
          onSelect={() => undefined}
          visibleMetadataKeys={[]}
        />
      </ToastProvider>,
    );

    expect(screen.queryByText(redundantMessage)).not.toBeInTheDocument();
    expect(screen.getByText("Lead viewed pricing page after opening a campaign email")).toBeInTheDocument();
  });

  it("renders missing messages and long identities without discarding their values", () => {
    const actorId = "actor-with-an-extremely-long-identifier-that-must-remain-available";
    const targetId = "target-with-an-equally-long-identifier-that-must-remain-available";
    render(
      <ToastProvider>
        <TimelineFeed
          events={[{ ...event, actor_id: actorId, target_id: targetId, message: "" }]}
          onSelect={() => undefined}
          visibleMetadataKeys={["source"]}
        />
      </ToastProvider>,
    );

    expect(screen.getByText(actorId)).toBeInTheDocument();
    expect(screen.getByText(targetId)).toBeInTheDocument();
    expect(screen.getByText("No message provided")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(actorId) })).toHaveAttribute("aria-pressed", "false");
  });

  it("expands JSON and copies metadata without selecting the row", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(
      <ToastProvider>
        <TimelineFeed
          events={[event]}
          selectedEventId="evt_1"
          onSelect={onSelect}
          visibleMetadataKeys={["source", "status"]}
        />
      </ToastProvider>,
    );

    const row = screen.getByRole("button", { name: /Open event details/ });
    const json = screen.getByRole("button", { name: "JSON" });
    expect(row).toHaveAttribute("aria-pressed", "true");
    expect(json).toHaveAttribute("aria-expanded", "false");

    await user.click(json);
    expect(json).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(json.getAttribute("aria-controls") ?? "")).toHaveTextContent('"source": "google_ads"');
    await user.click(screen.getByRole("button", { name: "Copy metadata" }));

    expect(writeText).toHaveBeenCalledWith(JSON.stringify(event.metadata, null, 2));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("reports a rejected metadata copy without claiming success", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new DOMException("Not allowed", "NotAllowedError"));
    render(
      <ToastProvider>
        <TimelineFeed events={[event]} onSelect={() => undefined} visibleMetadataKeys={["source"]} />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Copy metadata" }));

    expect(await screen.findByText("Unable to copy metadata. Check clipboard permissions and try again.")).toBeInTheDocument();
    expect(screen.queryByText("Metadata copied to clipboard.")).not.toBeInTheDocument();
  });
});
