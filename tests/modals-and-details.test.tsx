import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertsModal } from "@/components/AlertsModal";
import { ShareModal } from "@/components/ShareModal";
import { TimelineDetailsPanel } from "@/components/TimelineDetailsPanel";
import type { AlertRule, TimelineEvent } from "@/lib/types";

const pushToast = vi.fn();

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ pushToast }),
}));

const event: TimelineEvent = {
  id: "evt-42",
  tenant_id: "tenant-1",
  occurred_at: "2026-10-03T17:00:00Z",
  created_at: "2026-10-03T17:00:01Z",
  raw_log_level: "info",
  log_level: "info",
  actor: "user user-42",
  actor_type: "user",
  actor_id: "user-42",
  action: "updated",
  target_type: "invoice",
  target_id: "invoice-1001",
  message: "Invoice updated",
  metadata: { source: "billing", attempt: 2 },
};

describe("timeline dependent UI", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushToast.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an alert from canonical filters", async () => {
    const onClose = vi.fn();
    render(<AlertsModal open onClose={onClose} currentFilters={{ actor_id: "user-42" }} />);

    await userEvent.setup().click(screen.getByRole("button", { name: "Create alert" }));

    const stored = JSON.parse(window.localStorage.getItem("milog.alerts") ?? "[]") as AlertRule[];
    expect(stored).toEqual([expect.objectContaining({
      name: "user-42",
      enabled: true,
      filters: { actor_id: "user-42" },
    })]);
    expect(pushToast).toHaveBeenCalledWith({ title: "Alert saved locally.", tone: "success" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it.each([
    ["Disable", false, "Alert paused."],
    ["Delete", undefined, "Alert deleted."],
  ] as const)("persists the %s alert action", async (action, enabled, toastTitle) => {
    const saved: AlertRule = {
      id: "alert-1",
      name: "Invoice activity",
      enabled: true,
      filters: { type: "invoice" },
      created_at: "2026-10-03T17:00:00Z",
    };
    window.localStorage.setItem("milog.alerts", JSON.stringify([saved]));
    render(<AlertsModal open onClose={() => undefined} currentFilters={{}} />);

    await userEvent.setup().click(screen.getByRole("button", { name: action }));

    const stored = JSON.parse(window.localStorage.getItem("milog.alerts") ?? "[]") as AlertRule[];
    if (enabled === undefined) expect(stored).toEqual([]);
    else expect(stored[0]).toEqual(expect.objectContaining({ id: "alert-1", enabled }));
    expect(pushToast).toHaveBeenCalledWith({ title: toastTitle, tone: "success" });
  });

  it("generates a credential-free share URL and copies it", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    window.history.replaceState({}, "", "/timeline");
    render(<ShareModal open onClose={() => undefined} filters={{ actor_id: "user-42" }} />);

    const input = await screen.findByDisplayValue(new RegExp(`^${window.location.origin}/share/`));
    await user.click(screen.getByRole("button", { name: "Copy link" }));

    const url = String((input as HTMLInputElement).value);
    expect(url).not.toContain("token");
    expect(writeText).toHaveBeenCalledWith(url);
    expect(pushToast).toHaveBeenCalledWith({ title: "Share URL copied to clipboard.", tone: "success" });
  });

  it("copies actor, target, and raw metadata from event details", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<TimelineDetailsPanel event={event} />);

    await user.click(screen.getByRole("button", { name: "Copy actor ID" }));
    await user.click(screen.getByRole("button", { name: "Copy target ID" }));
    await user.click(screen.getByRole("button", { name: "Copy metadata" }));

    expect(writeText.mock.calls).toEqual([
      ["user-42"],
      ["invoice-1001"],
      [JSON.stringify(event.metadata, null, 2)],
    ]);
    expect(pushToast.mock.calls).toEqual([
      [{ title: "Actor ID copied to clipboard.", tone: "success" }],
      [{ title: "Target ID copied to clipboard.", tone: "success" }],
      [{ title: "Metadata copied to clipboard.", tone: "success" }],
    ]);
  });

  it.each([
    ["Copy actor ID", "Unable to copy actor ID. Check clipboard permissions and try again."],
    ["Copy target ID", "Unable to copy target ID. Check clipboard permissions and try again."],
    ["Copy metadata", "Unable to copy metadata. Check clipboard permissions and try again."],
  ])("reports failure when %s is rejected", async (buttonName, errorTitle) => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new DOMException("Not allowed", "NotAllowedError"));
    render(<TimelineDetailsPanel event={event} />);

    await userEvent.setup().click(screen.getByRole("button", { name: buttonName }));

    expect(pushToast).toHaveBeenCalledWith({ title: errorTitle, tone: "error" });
    expect(pushToast).not.toHaveBeenCalledWith(expect.objectContaining({ tone: "success" }));
  });
});
