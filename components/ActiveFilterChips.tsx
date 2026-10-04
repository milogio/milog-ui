"use client";

import { X } from "lucide-react";
import type { TimelineFilters } from "@/lib/types";
import { TIMELINE_FILTERS, type TimelineFilterKey } from "@/lib/timelineFilters";

type ActiveFilterKey = TimelineFilterKey | "log_level";

export function ActiveFilterChips({
  filters,
  onRemove,
  onClear,
}: {
  filters: TimelineFilters;
  onRemove: (key: ActiveFilterKey) => void;
  onClear: () => void;
}) {
  const active = TIMELINE_FILTERS.filter(({ key }) => filters[key]);
  const logLevels = filters.log_level ?? [];
  const activeCount = active.length + (logLevels.length ? 1 : 0);
  if (!activeCount) return null;

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
      {logLevels.length ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-foreground">
          <span className="text-muted-foreground">Log level:</span>
          <span>{logLevels.join(", ")}</span>
          <button
            className="rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => onRemove("log_level")}
            aria-label="Remove Log level filter"
          >
            <X className="size-3" />
          </button>
        </span>
      ) : null}
      {activeCount > 1 ? (
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          {logLevels.length ? "Log levels match any; other filters must match" : "All filters must match"}
        </span>
      ) : null}
      <button className="font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" onClick={onClear}>
        Clear all
      </button>
    </section>
  );
}
