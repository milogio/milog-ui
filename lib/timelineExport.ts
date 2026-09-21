import { getTimeline } from "@/lib/milogApi";
import type { TimelineFilters, TimelinePage } from "@/lib/types";

export const MAX_CLIENT_EXPORT_EVENTS = 10_000;

type TimelinePageFetcher = (filters: TimelineFilters, cursor?: string) => Promise<TimelinePage>;

export async function fetchTimelineForExport(
  filters: TimelineFilters,
  fetchPage: TimelinePageFetcher = getTimeline,
  maxEvents = MAX_CLIENT_EXPORT_EVENTS,
) {
  const events: TimelinePage["events"] = [];
  const seenEventIds = new Set<string>();
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  do {
    const page = await fetchPage(filters, cursor);
    for (const event of page.events) {
      if (seenEventIds.has(event.id)) continue;
      if (events.length >= maxEvents) {
        throw new Error(`Export exceeds the ${maxEvents.toLocaleString()} event browser limit.`);
      }
      seenEventIds.add(event.id);
      events.push(event);
    }

    cursor = page.nextCursor;
    if (cursor && seenCursors.has(cursor)) {
      throw new Error("MiLog returned a repeated pagination cursor.");
    }
    if (cursor) seenCursors.add(cursor);
  } while (cursor);

  return events;
}
