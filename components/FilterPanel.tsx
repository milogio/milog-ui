"use client";

import type { TimelineFilters } from "@/lib/types";
import { TIMELINE_FILTERS } from "@/lib/timelineFilters";

export function FilterPanel({
  filters,
  onChange,
  onClear,
  compact = false,
}: {
  filters: TimelineFilters;
  onChange: (filters: TimelineFilters) => void;
  onClear: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-border bg-card p-4 shadow-soft ${compact ? "" : "lg:sticky lg:top-24 lg:h-fit"}`}>
      <div className="mb-4 flex items-center justify-between">
        {compact ? (
          <div>
            <h3 className="text-base font-semibold text-foreground">Exact-match fields</h3>
            <p className="mt-1 text-xs text-muted-foreground">Every populated field must match.</p>
          </div>
        ) : (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gradient-brand">Query</p>
            <h3 className="mt-1 text-base font-semibold text-foreground">Filters</h3>
          </div>
        )}
        <button className="font-mono text-xs text-muted-foreground hover:text-foreground" onClick={onClear}>
          Clear query
        </button>
      </div>

      <div className="space-y-3">
        {TIMELINE_FILTERS.map(({ key, label, placeholder, help }) => (
          <label key={key} className="block space-y-1.5 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <input
              className="input"
              aria-label={label}
              maxLength={255}
              placeholder={placeholder}
              value={filters[key] ?? ""}
              onChange={(event) => onChange({ ...filters, [key]: event.target.value || undefined })}
            />
            <span className="block text-xs leading-5 text-muted-foreground">{help}</span>
          </label>
        ))}
        <p className="rounded-md border border-border bg-background px-3 py-2 text-xs leading-5 text-muted-foreground">
          Identifiers use exact, case-sensitive matching. Every populated field must match. Selected log levels match any
          level and combine with these fields.
        </p>
      </div>
    </div>
  );
}
