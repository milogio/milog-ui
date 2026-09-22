import { buildAlertRule, matchesAlert, migrateAlertRules } from "@/lib/alerts";
import { timelineToCsv } from "@/lib/export";
import { normalizeEvent, normalizeTimelineResponse } from "@/lib/milogApi";
import { decodeShareState, encodeShareState } from "@/lib/shareState";
import {
  filtersToSearchParams,
  hasLegacyTimelineFilters,
  sanitizeTimelineFilters,
  searchParamsToFilters,
  timelineFilterValidationMessage,
} from "@/lib/urlState";
import type { TimelineEvent, TimelineFilters } from "@/lib/types";

describe("MiLog utilities", () => {
  it("normalizes backend timeline events", () => {
    const event = normalizeEvent({
      id: "evt_1",
      tenant_id: "tenant_1",
      occurred_at: "2026-05-04T16:00:00Z",
      created_at: "2026-05-04T16:00:01Z",
      log_level: "warn",
      actor_type: "user",
      actor_id: "42",
      target_type: "invoice",
      target_id: "invoice-1",
      action: "updated",
      message: "User updated invoice",
      metadata: { source: "billing" },
    });

    expect(event.occurred_at).toBe("2026-05-04T16:00:00Z");
    expect(event.log_level).toBe("warning");
    expect(event.raw_log_level).toBe("warn");
    expect(event.created_at).toBe("2026-05-04T16:00:01Z");
    expect(event.actor).toBe("user 42");
    expect(event.target_id).toBe("invoice-1");
    expect(event.action).toBe("updated");
  });

  it("normalizes cursor-paginated timeline payloads", () => {
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
        meta: { next_cursor: "opaque-next-token", prev_cursor: null, per_page: 50 },
      },
    );

    expect(page.nextCursor).toBe("opaque-next-token");
    expect(page.total).toBeUndefined();
    expect(page.events).toHaveLength(1);
  });

  it("serializes and restores filter state", () => {
    const filters: TimelineFilters = {
      actor_id: "actor-42",
      target_id: "invoice-1",
      type: "invoice",
    };

    const params = filtersToSearchParams(filters);
    const restored = searchParamsToFilters(params);

    expect(restored).toEqual(filters);
  });

  it("drops unsupported and invalid legacy filter state", () => {
    const legacy = {
      actor: "Chris",
      message: "pricing",
      limit: 100,
      actor_id: " actor-42 ",
      target_id: "x".repeat(256),
    };

    expect(hasLegacyTimelineFilters(legacy)).toBe(true);
    expect(sanitizeTimelineFilters(legacy)).toEqual({ actor_id: "actor-42" });
  });

  it("returns an actionable error for oversized API filters", () => {
    const params = new URLSearchParams({ actor_id: "x".repeat(256) });
    expect(timelineFilterValidationMessage(params)).toBe("actor_id must be 255 characters or fewer.");
  });

  it("encodes and decodes share state", () => {
    const filters: TimelineFilters = {
      actor_id: "actor-42",
      type: "invoice",
    };

    const shareId = encodeShareState(filters);
    expect(decodeShareState(shareId)).toEqual(filters);
  });

  it("formats CSV exports using selected metadata columns", () => {
    const events: TimelineEvent[] = [
      {
        id: "evt_1",
        tenant_id: "tenant_1",
        occurred_at: "2026-05-04T16:00:00Z",
        created_at: "2026-05-04T16:00:01Z",
        raw_log_level: "info",
        log_level: "info",
        actor: "Chris",
        actor_id: "actor-42",
        actor_type: "user",
        action: "viewed",
        target_id: "pricing",
        target_type: "page",
        message: "Lead viewed pricing page",
        metadata: { source: "google_ads", lead_score: 78 },
      },
    ];

    const csv = timelineToCsv(events, ["source", "lead_score"]);

    expect(csv.split("\n")[0]).toBe(
      "id,tenant_id,occurred_at,created_at,log_level,raw_log_level,actor_type,actor_id,action,target_type,target_id,message,source,lead_score",
    );
    expect(csv).toContain('"2026-05-04T16:00:00Z","2026-05-04T16:00:01Z","info","info"');
    expect(csv).toContain("source,lead_score");
    expect(csv).toContain('"google_ads"');
    expect(csv).toContain('"78"');
  });

  it("matches alerts against normalized timeline events", () => {
    const rule = buildAlertRule("Pricing viewers", {
      actor_id: "actor-42",
      target_id: "invoice-1",
      type: "invoice",
    });

    const event: TimelineEvent = {
      id: "evt_1",
      tenant_id: "tenant_1",
      occurred_at: "2026-05-04T16:00:00Z",
      created_at: "2026-05-04T16:00:01Z",
      raw_log_level: "info",
      log_level: "info",
      actor: "Chris",
      actor_id: "actor-42",
      actor_type: "user",
      target_id: "invoice-1",
      target_type: "invoice",
      action: "viewed",
      message: "Lead viewed pricing page",
      metadata: { source: "google_ads" },
    };

    expect(matchesAlert(rule, event)).toBe(true);
  });

  it("rejects legacy unversioned share state", () => {
    const legacyShareId = Buffer.from("message=pricing", "utf8").toString("base64url");
    expect(decodeShareState(legacyShareId)).toBeNull();
  });

  it("removes legacy-only alerts and preserves supported filters", () => {
    const result = migrateAlertRules([
      {
        id: "legacy",
        name: "Legacy",
        enabled: true,
        filters: { message: "pricing" },
        created_at: "2026-09-19T00:00:00Z",
      },
      {
        id: "current",
        name: "Invoice activity",
        enabled: true,
        filters: { type: "invoice", message: "ignored legacy field" },
        created_at: "2026-09-19T00:00:00Z",
      },
    ]);

    expect(result.migrated).toBe(true);
    expect(result.alerts).toEqual([
      expect.objectContaining({ id: "current", filters: { type: "invoice" } }),
    ]);
  });
});
