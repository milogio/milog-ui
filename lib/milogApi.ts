import type {
  ApiTimelineEvent,
  ApiTimelineResponse,
  MiLogTenant,
  MiLogUser,
  TimelineEvent,
  TimelineFilters,
  TimelinePage,
} from "@/lib/types";
import { normalizeLogLevel } from "@/lib/utils";
import { filtersToSearchParams } from "@/lib/urlState";

export function normalizeEvent(input: ApiTimelineEvent): TimelineEvent {
  return {
    id: input.id,
    tenant_id: input.tenant_id,
    occurred_at: input.occurred_at ?? input.occurrence_date ?? null,
    created_at: input.created_at ?? null,
    raw_log_level: input.log_level,
    log_level: normalizeLogLevel(input.log_level),
    actor: input.actor ?? ([input.actor_type, input.actor_id].filter(Boolean).join(" ") || "system"),
    actor_id: input.actor_id ?? null,
    actor_type: input.actor_type ?? null,
    target_id: input.target_id ?? null,
    target_type: input.target_type ?? null,
    action: input.action ?? null,
    message: input.message,
    metadata: input.metadata ?? {},
  };
}

export async function login(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message ?? "Login failed.");
  }

  return payload as { user: MiLogUser; tenant: MiLogTenant };
}

export async function getTimeline(filters: TimelineFilters, cursor?: string) {
  const params = filtersToSearchParams(filters);
  if (cursor) params.set("cursor", cursor);

  const query = params.toString();
  const response = await fetch(query ? `/api/timeline?${query}` : "/api/timeline", {
    credentials: "include",
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to load MiLog timeline.");
  }

  return payload as TimelinePage;
}

export async function createShareLink(filters: TimelineFilters) {
  const { encodeShareState } = await import("@/lib/shareState");
  return `${window.location.origin}/share/${encodeShareState(filters)}`;
}

function cursorFromNextLink(nextLink?: string | null) {
  if (!nextLink) return undefined;

  try {
    return new URL(nextLink).searchParams.get("cursor") ?? undefined;
  } catch {
    return undefined;
  }
}

export function normalizeTimelineResponse(payload: ApiTimelineResponse): TimelinePage {
  const nextCursor = payload.meta?.next_cursor ?? cursorFromNextLink(payload.links?.next);

  return {
    events: payload.data.map(normalizeEvent),
    nextCursor: nextCursor || undefined,
    total: payload.meta?.total,
  };
}
