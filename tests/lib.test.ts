import { buildAlertRule, matchesAlert } from "@/lib/alerts";
import { timelineToCsv } from "@/lib/export";
import { normalizeEvent, normalizeTimelineResponse } from "@/lib/milogApi";
import { decodeShareState, encodeShareState } from "@/lib/shareState";
import { filtersToSearchParams, searchParamsToFilters } from "@/lib/urlState";
import type { TimelineEvent, TimelineFilters } from "@/lib/types";

describe("MiLog utilities", () => {
  it("normalizes backend timeline events", () => {
    const event = normalizeEvent({
      id: "evt_1",
      tenant_id: "tenant_1",
      occurred_at: "2026-05-04T16:00:00Z",
      log_level: "warn",
      actor_type: "user",
      actor_id: "42",
      message: "User updated invoice",
      metadata: { source: "billing" },
    });

    expect(event.occurrence_date).toBe("2026-05-04T16:00:00Z");
    expect(event.log_level).toBe("warning");
    expect(event.actor).toBe("user 42");
  });

  it("normalizes paginated timeline payloads", () => {
    const page = normalizeTimelineResponse(
      {
        data: [
          {
            id: "evt_1",
            tenant_id: "tenant_1",
            occurrence_date: "2026-05-04T16:00:00Z",
            log_level: "info",
            actor: "Chris",
            message: "Lead viewed pricing page",
            metadata: {},
          },
        ],
        meta: { current_page: 1, last_page: 3, total: 120 },
      },
      undefined,
    );

    expect(page.nextCursor).toBe("2");
    expect(page.total).toBe(120);
    expect(page.events).toHaveLength(1);
  });

  it("serializes and restores filter state", () => {
    const filters: TimelineFilters = {
      start_date: "2026-05-01T00:00",
      end_date: "2026-05-02T00:00",
      log_level: ["info", "error"],
      actor: "Chris",
      metadata_key: "campaign",
      metadata_value: "mortgage",
      limit: 50,
    };

    const params = filtersToSearchParams(filters);
    const restored = searchParamsToFilters(params);

    expect(restored).toEqual(filters);
  });

  it("encodes and decodes share state", () => {
    const filters: TimelineFilters = {
      message: "pricing",
      log_level: ["info"],
      limit: 25,
    };

    const shareId = encodeShareState(filters);
    expect(decodeShareState(shareId)).toEqual(filters);
  });

  it("formats CSV exports using selected metadata columns", () => {
    const events: TimelineEvent[] = [
      {
        id: "evt_1",
        tenant_id: "tenant_1",
        occurrence_date: "2026-05-04T16:00:00Z",
        log_level: "info",
        actor: "Chris",
        message: "Lead viewed pricing page",
        metadata: { source: "google_ads", lead_score: 78 },
      },
    ];

    const csv = timelineToCsv(events, ["source", "lead_score"]);

    expect(csv).toContain("source,lead_score");
    expect(csv).toContain('"google_ads"');
    expect(csv).toContain('"78"');
  });

  it("matches alerts against normalized timeline events", () => {
    const rule = buildAlertRule("Pricing viewers", {
      message: "pricing",
      log_level: ["info"],
      metadata_key: "source",
      metadata_value: "google",
    });

    const event: TimelineEvent = {
      id: "evt_1",
      tenant_id: "tenant_1",
      occurrence_date: "2026-05-04T16:00:00Z",
      log_level: "info",
      actor: "Chris",
      message: "Lead viewed pricing page",
      metadata: { source: "google_ads" },
    };

    expect(matchesAlert(rule, event)).toBe(true);
  });
});
