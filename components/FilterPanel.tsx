"use client";

import type { TimelineFilters } from "@/lib/types";

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
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gradient-brand">Query</p>
          <h3 className="mt-1 text-base font-semibold text-foreground">Filters</h3>
        </div>
        <button className="font-mono text-xs text-muted-foreground hover:text-foreground" onClick={onClear}>
          Clear
        </button>
      </div>

      <div className="space-y-3">
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Actor ID</span>
          <input
            className="input"
            maxLength={255}
            placeholder="actor-42"
            value={filters.actor_id ?? ""}
            onChange={(event) => onChange({ ...filters, actor_id: event.target.value || undefined })}
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Target ID</span>
          <input
            className="input"
            maxLength={255}
            placeholder="invoice-123"
            value={filters.target_id ?? ""}
            onChange={(event) => onChange({ ...filters, target_id: event.target.value || undefined })}
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Actor or target type</span>
          <input
            className="input"
            maxLength={255}
            placeholder="invoice"
            value={filters.type ?? ""}
            onChange={(event) => onChange({ ...filters, type: event.target.value || undefined })}
          />
        </label>
      </div>
    </div>
  );
}
