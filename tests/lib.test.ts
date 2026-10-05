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
import { createRuntimeId, formatExactTimestamp, formatRelativeTime } from "@/lib/utils";

describe("MiLog utilities", () => {
  it("creates IDs when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {
      getRandomValues(values: Uint32Array) {
        values.set([1, 2, 3, 4]);
        return values;
      },
    });

    expect(createRuntimeId()).toBe("00000001-00000002-00000003-00000004");
    vi.unstubAllGlobals();
  });

  it("formats equivalent event instants as the same exact UTC timestamp", () => {
    const utcValue = "2026-01-01T00:30:45Z";
    const offsetValue = "2025-12-31T16:30:45-08:00";

    expect(formatExactTimestamp(utcValue)).toBe("2026-01-01 00:30:45 UTC");
    expect(formatExactTimestamp(offsetValue)).toBe("2026-01-01 00:30:45 UTC");
    expect(formatRelativeTime(offsetValue)).toBe(formatRelativeTime(utcValue));
    expect(formatExactTimestamp(null)).toBe("Unknown");
    expect(formatExactTimestamp("invalid timestamp")).toBe("Unknown");
  });

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
      log_level: ["debug", "warning", "error"],
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

  it("canonicalizes level filters, deduplicates values, and rejects invalid URL values", () => {
    expect(sanitizeTimelineFilters({ log_level: ["error", "debug", "error", "unknown"] })).toEqual({
      log_level: ["debug", "error"],
    });
    expect(filtersToSearchParams({ log_level: ["error", "debug"] }).toString()).toBe("log_level=debug%2Cerror");
    expect(searchParamsToFilters(new URLSearchParams("log_level=warning%2Cerror"))).toEqual({
      log_level: ["warning", "error"],
    });
    expect(timelineFilterValidationMessage(new URLSearchParams("log_level=error%2Cerror"))).toBeUndefined();
    expect(searchParamsToFilters(new URLSearchParams("log_level=error%2Cerror"))).toEqual({ log_level: ["error"] });
    expect(timelineFilterValidationMessage(new URLSearchParams("log_level=info%2Cnope"))).toContain("only");
  });

  it("encodes and decodes share state", () => {
    const filters: TimelineFilters = {
      actor_id: "actor-42",
      type: "invoice",
      log_level: ["warning", "error"],
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
      log_level: ["info"],
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
    expect(matchesAlert({ ...rule, filters: { log_level: ["error"] } }, event)).toBe(false);
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
