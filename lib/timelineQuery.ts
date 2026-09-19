import type { TimelineFilters } from "@/lib/types";

export function buildTimelineApiSearchParams(filters: TimelineFilters, cursor?: string) {
  const params = new URLSearchParams();
  params.set("pagination", "cursor");
  if (filters.start_date) params.set("start_date", filters.start_date);
  if (filters.end_date) params.set("end_date", filters.end_date);
  if (filters.actor) params.set("actor", filters.actor);
  if (filters.message) params.set("message", filters.message);
  if (filters.metadata_key) params.set("metadata_key", filters.metadata_key);
  if (filters.metadata_value) params.set("metadata_value", filters.metadata_value);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.log_level?.length) params.set("log_level", filters.log_level.join(","));
  if (cursor) params.set("cursor", cursor);
  return params;
}
