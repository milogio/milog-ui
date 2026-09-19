import { createShareLink, getTimeline, login, normalizeEvent, normalizeTimelineResponse } from "@/lib/milogApi";
import { decodeShareState } from "@/lib/shareState";
import { buildTimelineApiSearchParams } from "@/lib/timelineQuery";
import type { ApiTimelineResponse, TimelineFilters } from "@/lib/types";

function jsonResponse(payload: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("milogApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("normalizeEvent", () => {
    it.each([
      ["warn", "warning"],
      ["warning", "warning"],
      ["fatal", "error"],
      ["error", "error"],
      ["trace", "debug"],
      ["debug", "debug"],
      ["success", "success"],
      ["unknown", "info"],
    ])("normalizes %s log level to %s", (inputLevel, expectedLevel) => {
      expect(
        normalizeEvent({
          id: "evt_1",
          tenant_id: "tenant_1",
          occurred_at: "2026-05-04T16:00:00Z",
          log_level: inputLevel,
          message: "Event happened",
        }).log_level,
      ).toBe(expectedLevel);
    });

    it("prefers occurrence_date and display actor when provided", () => {
      const event = normalizeEvent({
        id: "evt_1",
        tenant_id: "tenant_1",
        occurrence_date: "2026-05-04T16:00:00Z",
        occurred_at: "2026-05-01T12:00:00Z",
        log_level: "info",
        actor: "Chris",
        actor_id: "user_123",
        actor_type: "user",
        message: "Lead viewed pricing page",
        metadata: { source: "google_ads" },
      });

      expect(event.occurrence_date).toBe("2026-05-04T16:00:00Z");
      expect(event.actor).toBe("Chris");
      expect(event.metadata).toEqual({ source: "google_ads" });
    });

    it("derives actor from backend actor fields and falls back to system", () => {
      expect(
        normalizeEvent({
          id: "evt_1",
          tenant_id: "tenant_1",
          occurred_at: "2026-05-04T16:00:00Z",
          log_level: "info",
          actor_type: "user",
          actor_id: "42",
          message: "User updated invoice",
        }).actor,
      ).toBe("user 42");

      expect(
        normalizeEvent({
          id: "evt_2",
          tenant_id: "tenant_1",
          occurred_at: "2026-05-04T16:00:00Z",
          log_level: "info",
          message: "System job completed",
        }).actor,
      ).toBe("system");
    });

    it("fills missing metadata and timestamp with safe defaults", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-04T16:00:00Z"));

      const event = normalizeEvent({
        id: "evt_1",
        tenant_id: "tenant_1",
        log_level: "info",
        message: "Missing optional backend fields",
      });

      expect(event.occurrence_date).toBe("2026-05-04T16:00:00.000Z");
      expect(event.metadata).toEqual({});

      vi.useRealTimers();
    });
  });

  describe("normalizeTimelineResponse", () => {
    it("maps every event and returns no cursor on the last cursor page", () => {
      const payload: ApiTimelineResponse = {
        data: [
          {
            id: "evt_1",
            tenant_id: "tenant_1",
            occurred_at: "2026-05-04T16:00:00Z",
            log_level: "fatal",
            actor_type: "service",
            actor_id: "checkout",
            message: "Payment failed",
          },
        ],
        meta: { next_cursor: null, prev_cursor: "opaque-previous-token", per_page: 25 },
      };

      const page = normalizeTimelineResponse(payload);

      expect(page.events).toEqual([
        expect.objectContaining({
          id: "evt_1",
          occurrence_date: "2026-05-04T16:00:00Z",
          log_level: "error",
          actor: "service checkout",
          metadata: {},
        }),
      ]);
      expect(page.nextCursor).toBeUndefined();
      expect(page.total).toBeUndefined();
    });

    it("uses the opaque cursor from the next link when metadata is absent", () => {
      const page = normalizeTimelineResponse({
        data: [],
        links: { next: "https://api.milog.local/api/v1/timeline?pagination=cursor&cursor=opaque%2Btoken" },
      });

      expect(page.events).toEqual([]);
      expect(page.nextCursor).toBe("opaque+token");
      expect(page.total).toBeUndefined();
    });

    it("does not turn offset pagination metadata into a cursor", () => {
      const page = normalizeTimelineResponse({
        data: [],
        meta: { current_page: 1, last_page: 3, total: 75 },
        links: { next: "https://api.milog.local/api/v1/timeline?page=2" },
      });

      expect(page.nextCursor).toBeUndefined();
      expect(page.total).toBe(75);
    });
  });

  describe("buildTimelineApiSearchParams", () => {
    it("requests cursor pagination from the first page", () => {
      const params = buildTimelineApiSearchParams({ limit: 25 });

      expect(params.get("pagination")).toBe("cursor");
      expect(params.has("cursor")).toBe(false);
      expect(params.has("page")).toBe(false);
    });

    it("forwards opaque cursors without creating an offset page", () => {
      const params = buildTimelineApiSearchParams({ actor: "Chris" }, "opaque+/cursor-token");

      expect(params.get("pagination")).toBe("cursor");
      expect(params.get("cursor")).toBe("opaque+/cursor-token");
      expect(params.has("page")).toBe(false);
    });
  });

  describe("login", () => {
    it("posts credentials to the local auth proxy and returns user context", async () => {
      const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        jsonResponse({
          user: { id: "user_1", name: "Chris", email: "chris@example.com", tenant_id: "tenant_1" },
          tenant: { id: "tenant_1", name: "SonicCode" },
        }),
      );

      const session = await login("chris@example.com", "correct-password");

      expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "chris@example.com", password: "correct-password" }),
      });
      expect(session.tenant.name).toBe("SonicCode");
    });

    it("throws the API message when login fails", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        jsonResponse({ message: "Invalid email or password." }, { status: 401 }),
      );

      await expect(login("chris@example.com", "wrong-password")).rejects.toThrow("Invalid email or password.");
    });

    it("uses a friendly fallback message when login fails without a message", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({}, { status: 500 }));

      await expect(login("chris@example.com", "password")).rejects.toThrow("Login failed.");
    });
  });

  describe("getTimeline", () => {
    it("serializes filters for the timeline proxy and includes cookies", async () => {
      const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        jsonResponse({
          events: [],
          nextCursor: "2",
          total: 10,
        }),
      );
      const filters: TimelineFilters = {
        start_date: "2026-05-01T00:00",
        end_date: "2026-05-04T00:00",
        log_level: ["info", "error"],
        actor: "Chris",
        message: "pricing page",
        metadata_key: "source",
        metadata_value: "google_ads",
        limit: 50,
      };

      const page = await getTimeline(filters, "opaque-cursor-token");

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(String(url)).toBe(
        "/api/timeline?start_date=2026-05-01T00%3A00&end_date=2026-05-04T00%3A00&actor=Chris&message=pricing+page&metadata_key=source&metadata_value=google_ads&limit=50&log_level=info%2Cerror&cursor=opaque-cursor-token",
      );
      expect(options).toEqual({ credentials: "include" });
      expect(page).toEqual({ events: [], nextCursor: "2", total: 10 });
    });

    it("omits undefined and empty array filters", async () => {
      const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ events: [] }));

      await getTimeline({ actor: undefined, log_level: [], limit: 25 });

      expect(fetchMock).toHaveBeenCalledWith("/api/timeline?limit=25", { credentials: "include" });
    });

    it("does not serialize legacy cursor properties as filters", async () => {
      const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ events: [] }));
      const filters = { limit: 25, cursor: "stale-cursor" } as TimelineFilters;

      await getTimeline(filters);

      expect(fetchMock).toHaveBeenCalledWith("/api/timeline?limit=25", { credentials: "include" });
    });

    it("throws the API message when timeline loading fails", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        jsonResponse({ message: "Timeline unavailable." }, { status: 503 }),
      );

      await expect(getTimeline({ message: "pricing" })).rejects.toThrow("Timeline unavailable.");
    });

    it("uses a friendly fallback message when timeline loading fails without a message", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({}, { status: 500 }));

      await expect(getTimeline({})).rejects.toThrow("Unable to load MiLog timeline.");
    });
  });

  describe("createShareLink", () => {
    it("creates a share URL that preserves the filter state", async () => {
      const filters: TimelineFilters = {
        message: "pricing",
        log_level: ["warning"],
        metadata_key: "campaign",
        metadata_value: "mortgage",
      };

      const url = await createShareLink(filters);
      const shareId = url.split("/share/")[1];

      expect(url).toMatch(/^http:\/\/localhost:3000\/share\//);
      expect(decodeShareState(shareId)).toEqual(filters);
    });
  });
});
