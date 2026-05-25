import type {
  ApiTimelineResponse,
  MiLogTenant,
  MiLogUser,
  TimelineEvent,
  TimelineFilters,
  TimelinePage,
} from "@/lib/types";
import { normalizeLogLevel } from "@/lib/utils";

export function normalizeEvent(input: {
  id: string;
  tenant_id: string;
  occurrence_date?: string;
  occurred_at?: string;
  log_level: string;
  actor?: string;
  actor_id?: string;
  actor_type?: string;
  message: string;
  metadata?: Record<string, unknown>;
}): TimelineEvent {
  return {
    id: input.id,
    tenant_id: input.tenant_id,
    occurrence_date: input.occurrence_date ?? input.occurred_at ?? new Date().toISOString(),
    log_level: normalizeLogLevel(input.log_level),
    actor: input.actor ?? ([input.actor_type, input.actor_id].filter(Boolean).join(" ") || "system"),
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

export async function getTimeline(filters: TimelineFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
      continue;
    }
    params.set(key, String(value));
  }

  const response = await fetch(`/api/timeline?${params.toString()}`, {
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

export function normalizeTimelineResponse(payload: ApiTimelineResponse, fallbackCursor?: string): TimelinePage {
  const currentPage = payload.meta?.current_page ?? Number(fallbackCursor ?? 1);
  const lastPage = payload.meta?.last_page ?? currentPage;

  return {
    events: payload.data.map(normalizeEvent),
    nextCursor: currentPage < lastPage ? String(currentPage + 1) : undefined,
    total: payload.meta?.total,
  };
}
