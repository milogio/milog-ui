import type { TimelineEvent, TimelineFilters } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { TimelineItem } from "@/components/TimelineItem";

export function TimelineFeed({
  events,
  selectedEventId,
  onSelect,
  visibleMetadataKeys,
  hasNextPage,
  onLoadMore,
  isLoading,
  isFetchingNextPage,
  readOnly = false,
  filters = {},
}: {
  events: TimelineEvent[];
  selectedEventId?: string;
  onSelect: (event: TimelineEvent) => void;
  visibleMetadataKeys: string[];
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  readOnly?: boolean;
  filters?: TimelineFilters;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!events.length) {
    const activeFilterCount = Object.values(filters).filter(Boolean).length;
    return (
      <EmptyState
        title="No events match this query"
        description={activeFilterCount > 1
          ? `${activeFilterCount} filters are combined with AND. Remove one or clear the query to broaden the results.`
          : "Check the exact actor ID, target ID, or entity type, or clear the query to broaden the results."}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="grid grid-cols-[78px_70px_minmax(0,1fr)_auto] gap-2 border-b border-border px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground sm:grid-cols-[120px_78px_minmax(0,1fr)_auto] sm:gap-3">
        <span>Time</span>
        <span>Level</span>
        <span>Actor → Action → Target</span>
        <span className="text-right">Actions</span>
      </div>
      <ul className="divide-y divide-border/60 font-mono text-[12.5px]">
        {events.map((event) => (
          <TimelineItem
            key={event.id}
            event={event}
            selected={selectedEventId === event.id}
            onSelect={() => onSelect(event)}
            visibleMetadataKeys={visibleMetadataKeys}
            readOnly={readOnly}
          />
        ))}
      </ul>
      {hasNextPage && onLoadMore ? (
        <div className="flex justify-center border-t border-border px-4 py-3">
          <button className="btn btn-secondary min-w-40" onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
