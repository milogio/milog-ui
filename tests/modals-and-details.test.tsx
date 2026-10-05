import { useState } from "react";
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
    ["Disable", true, false, "Alert paused."],
    ["Enable", false, true, "Alert enabled."],
    ["Delete", true, undefined, "Alert deleted."],
  ] as const)("persists the %s alert action", async (action, initialEnabled, enabled, toastTitle) => {
    const saved: AlertRule = {
      id: "alert-1",
      name: "Invoice activity",
      enabled: initialEnabled,
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

  it("reports a rejected share-link copy without claiming success", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new DOMException("Not allowed", "NotAllowedError"));
    render(<ShareModal open onClose={() => undefined} filters={{ type: "invoice" }} />);

    await userEvent.setup().click(await screen.findByRole("button", { name: "Copy link" }));

    expect(pushToast).toHaveBeenCalledWith({
      title: "Unable to copy the share URL. Check clipboard permissions and try again.",
      tone: "error",
    });
    expect(pushToast).not.toHaveBeenCalledWith(expect.objectContaining({ tone: "success" }));
  });

  it("labels the share modal, closes it with Escape, and returns focus", async () => {
    const user = userEvent.setup();

    function ShareHarness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Share</button>
          <ShareModal open={open} onClose={() => setOpen(false)} filters={{}} />
        </>
      );
    }

    render(<ShareHarness />);
    const trigger = screen.getByRole("button", { name: "Share" });
    await user.click(trigger);

    expect(screen.getByRole("dialog", { name: "Share this filtered view" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Share this filtered view" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
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
