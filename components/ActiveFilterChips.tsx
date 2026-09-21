"use client";

import { X } from "lucide-react";
import type { TimelineFilters } from "@/lib/types";
import { TIMELINE_FILTERS, type TimelineFilterKey } from "@/lib/timelineFilters";

export function ActiveFilterChips({
  filters,
  onRemove,
  onClear,
}: {
  filters: TimelineFilters;
  onRemove: (key: TimelineFilterKey) => void;
  onClear: () => void;
}) {
  const active = TIMELINE_FILTERS.filter(({ key }) => filters[key]);
  if (!active.length) return null;

  return (
    <section aria-label="Active timeline filters" className="flex flex-wrap items-center gap-2">
      {active.map(({ key, label }) => (
        <span key={key} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-foreground">
          <span className="text-muted-foreground">{label}:</span>
          <span>{filters[key]}</span>
          <button
            className="rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => onRemove(key)}
            aria-label={`Remove ${label} filter`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      {active.length > 1 ? <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">All filters must match</span> : null}
      <button className="font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" onClick={onClear}>
        Clear all
      </button>
    </section>
  );
}
