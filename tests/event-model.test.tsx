import { render, screen } from "@testing-library/react";
import { TimelineDetailsPanel } from "@/components/TimelineDetailsPanel";
import { ToastProvider } from "@/providers/toast-provider";
import type { TimelineEvent } from "@/lib/types";

const event: TimelineEvent = {
  id: "evt-42",
  tenant_id: "tenant-7",
  occurred_at: "2026-09-21T12:00:00Z",
  created_at: "2026-09-21T12:00:01Z",
  raw_log_level: "warn",
  log_level: "warning",
  actor: "User 42",
  actor_type: "user",
  actor_id: "user-42",
  action: "updated",
  target_type: "invoice",
  target_id: "invoice-1001",
  message: "User updated an invoice",
  metadata: { source: "billing" },
};

function renderDetails(value: TimelineEvent) {
  return render(
    <ToastProvider>
      <TimelineDetailsPanel event={value} />
    </ToastProvider>,
  );
}

describe("expanded timeline event model", () => {
  it("shows canonical actor, action, target, timestamps, identifiers, and raw severity", () => {
    renderDetails(event);

    expect(screen.getByLabelText("Actor: user user-42")).toBeInTheDocument();
    expect(screen.getByLabelText("Action: updated")).toBeInTheDocument();
    expect(screen.getByLabelText("Target: invoice invoice-1001")).toBeInTheDocument();
    expect(screen.getByText("warn (displayed as warning)")).toBeInTheDocument();
    expect(screen.getByText("evt-42")).toBeInTheDocument();
    expect(screen.getByText("tenant-7")).toBeInTheDocument();
    expect(screen.getAllByText(/September 21st, 2026/)).toHaveLength(2);
  });

  it("renders missing nullable values safely", () => {
    renderDetails({
      ...event,
      occurred_at: null,
      created_at: null,
      raw_log_level: null,
      actor_type: null,
      actor_id: null,
      action: null,
      target_type: null,
      target_id: null,
    });

    expect(screen.getAllByText("Unknown")).toHaveLength(3);
    expect(screen.getByLabelText("Actor: unknown type unknown identifier")).toBeInTheDocument();
    expect(screen.getByLabelText("Action: unknown")).toBeInTheDocument();
    expect(screen.getByLabelText("Target: unknown type unknown identifier")).toBeInTheDocument();
  });
});
