import { checkpointAlert, isEventAfterAlertCheckpoint } from "@/lib/alerts";
import { safeInternalPath } from "@/lib/navigation";
import { fetchTimelineForExport } from "@/lib/timelineExport";
import type { AlertRule, TimelineEvent, TimelinePage } from "@/lib/types";

function event(id: string, overrides: Partial<TimelineEvent> = {}): TimelineEvent {
  return {
    id,
    tenant_id: "tenant-1",
    occurrence_date: "2026-09-21T12:00:00Z",
    created_at: "2026-09-21T12:00:01Z",
    log_level: "info",
    actor: "user user-42",
    actor_type: "user",
    actor_id: "user-42",
    action: "created",
    target_type: "invoice",
    target_id: "invoice-1",
    message: "user user-42 created invoice invoice-1",
    metadata: {},
    ...overrides,
  };
}

describe("dependent timeline features", () => {
  it("exports every cursor page once while preserving API order", async () => {
    const pages: Record<string, TimelinePage> = {
      first: { events: [event("evt-3"), event("evt-2")], nextCursor: "opaque-2" },
      "opaque-2": { events: [event("evt-2"), event("evt-1")] },
    };
    const fetchPage = vi.fn(async (_filters, cursor?: string) => pages[cursor ?? "first"]);

    const events = await fetchTimelineForExport({ actor_id: "user-42" }, fetchPage);

    expect(events.map(({ id }) => id)).toEqual(["evt-3", "evt-2", "evt-1"]);
    expect(fetchPage.mock.calls).toEqual([
      [{ actor_id: "user-42" }, undefined],
      [{ actor_id: "user-42" }, "opaque-2"],
    ]);
  });

  it("rejects repeated cursors and oversized browser exports", async () => {
    await expect(fetchTimelineForExport({}, async () => ({ events: [], nextCursor: "repeat" })))
      .rejects.toThrow("repeated pagination cursor");

    await expect(fetchTimelineForExport({}, async () => ({ events: [event("evt-1"), event("evt-2")] }), 1))
      .rejects.toThrow("1 event browser limit");
  });

  it("propagates page failures instead of returning a partial export", async () => {
    const fetchPage = vi.fn(async (_filters, cursor?: string) => {
      if (cursor) throw new Error("Second page unavailable.");
      return { events: [event("evt-2")], nextCursor: "opaque-2" };
    });

    await expect(fetchTimelineForExport({}, fetchPage)).rejects.toThrow("Second page unavailable.");
  });

  it("uses occurrence time, creation time, and event ID as an alert checkpoint", () => {
    const rule: AlertRule = {
      id: "alert-1",
      name: "Invoice activity",
      enabled: true,
      filters: { type: "invoice" },
      created_at: "2026-09-21T00:00:00Z",
      last_triggered_at: "2026-09-21T12:00:00Z",
      last_triggered_created_at: "2026-09-21T12:00:01Z",
      last_triggered_event_id: "evt-2",
    };

    expect(isEventAfterAlertCheckpoint(rule, event("evt-2"))).toBe(false);
    expect(isEventAfterAlertCheckpoint(rule, event("evt-3"))).toBe(true);
    expect(isEventAfterAlertCheckpoint(rule, event("evt-1"))).toBe(false);
    expect(isEventAfterAlertCheckpoint(rule, event("evt-0", { occurrence_date: "2026-09-21T12:01:00Z" }))).toBe(true);
  });

  it("records the complete checkpoint and clears a previous polling error", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-21T13:00:00Z"));
    const rule: AlertRule = {
      id: "alert-1",
      name: "Invoice activity",
      enabled: true,
      filters: { type: "invoice" },
      created_at: "2026-09-21T00:00:00Z",
      last_error: "Temporary failure",
    };

    expect(checkpointAlert(rule, event("evt-3"))).toEqual(expect.objectContaining({
      last_triggered_at: "2026-09-21T12:00:00Z",
      last_triggered_created_at: "2026-09-21T12:00:01Z",
      last_triggered_event_id: "evt-3",
      last_checked_at: "2026-09-21T13:00:00.000Z",
      last_error: undefined,
    }));
    vi.useRealTimers();
  });

  it("accepts only local post-login destinations", () => {
    expect(safeInternalPath("/share/token-1")).toBe("/share/token-1");
    expect(safeInternalPath("https://evil.example")).toBe("/timeline");
    expect(safeInternalPath("//evil.example")).toBe("/timeline");
    expect(safeInternalPath("/\\evil.example")).toBe("/timeline");
  });
});
