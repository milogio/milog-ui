"use client";

import { useState } from "react";
import type { TimelineDensity, TimelineEvent, TimelineFilters } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { TimelineItem } from "@/components/TimelineItem";

const DENSITY_STORAGE_KEY = "milog.timeline-density";

function loadDensity(): TimelineDensity {
  if (typeof window === "undefined") return "comfortable";
  return window.localStorage.getItem(DENSITY_STORAGE_KEY) === "compact" ? "compact" : "comfortable";
}

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
  const [density, setDensity] = useState<TimelineDensity>(loadDensity);

  function changeDensity(value: TimelineDensity) {
    setDensity(value);
    window.localStorage.setItem(DENSITY_STORAGE_KEY, value);
  }

  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading timeline events" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!events.length) {
    const activeFilterCount = Object.values(filters).filter(Boolean).length;
    const filterDescription = filters.log_level?.length
      ? "Selected log levels match any level; actor, target, and type filters must also match. Remove a level or clear the query to broaden the results."
      : activeFilterCount > 1
        ? `${activeFilterCount} filters are combined with AND. Remove one or clear the query to broaden the results.`
        : "Check the exact actor ID, target ID, or entity type, or clear the query to broaden the results.";
    return (
      <EmptyState
        title="No events match this query"
        description={filterDescription}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 sm:px-4">
        <p className="text-sm font-medium text-foreground">Event stream</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Density</span>
          <div className="inline-flex rounded-md border border-input bg-background p-0.5" role="group" aria-label="Timeline density">
            {(["comfortable", "compact"] as const).map((value) => {
              const active = density === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={`rounded-[calc(var(--radius-control)-2px)] px-2.5 py-1.5 text-xs font-medium ${active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  aria-pressed={active}
                  onClick={() => changeDensity(value)}
                >
                  {value === "comfortable" ? "Comfortable" : "Compact"}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="hidden grid-cols-[150px_78px_minmax(0,1fr)_auto] gap-3 border-b border-border px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground sm:grid">
        <span>Time</span>
        <span>Level</span>
        <span>Actor → Action → Target</span>
        <span className="text-right">Actions</span>
      </div>
      <ul className={`divide-y divide-border/60 font-mono ${density === "compact" ? "text-xs" : "text-[13px]"}`}>
        {events.map((event) => (
          <TimelineItem
            key={event.id}
            event={event}
            selected={selectedEventId === event.id}
            onSelect={() => onSelect(event)}
            visibleMetadataKeys={visibleMetadataKeys}
            readOnly={readOnly}
            density={density}
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
