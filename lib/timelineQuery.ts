import type { TimelineFilters } from "@/lib/types";

export function buildTimelineApiSearchParams(filters: TimelineFilters, cursor?: string) {
  const params = new URLSearchParams();
  params.set("pagination", "cursor");
  if (filters.target_id) params.set("target_id", filters.target_id);
  if (filters.actor_id) params.set("actor_id", filters.actor_id);
  if (filters.type) params.set("type", filters.type);
  if (cursor) params.set("cursor", cursor);
  return params;
}
