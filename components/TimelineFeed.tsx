import type { TimelineEvent } from "@/lib/types";
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
    return (
      <EmptyState
        title="No events match this query"
        description="Adjust your filters, widen the date range, or clear the query to bring more signal into view."
      />
    );
  }

  return (
    <div className="space-y-4">
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
      {hasNextPage && onLoadMore ? (
        <div className="flex justify-center pt-2">
          <button className="btn btn-secondary min-w-40" onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
