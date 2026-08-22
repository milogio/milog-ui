"use client";

import type { LogLevel, TimelineFilters } from "@/lib/types";

const levels: LogLevel[] = ["debug", "info", "success", "warning", "error"];

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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <label className="space-y-1.5 text-sm">
            <span className="text-muted-foreground">Start date</span>
            <input
              className="input"
              type="datetime-local"
              value={filters.start_date ?? ""}
              onChange={(event) => onChange({ ...filters, start_date: event.target.value || undefined })}
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="text-muted-foreground">End date</span>
            <input
              className="input"
              type="datetime-local"
              value={filters.end_date ?? ""}
              onChange={(event) => onChange({ ...filters, end_date: event.target.value || undefined })}
            />
          </label>
        </div>

        <div>
          <span className="mb-2 block text-sm text-muted-foreground">Log levels</span>
          <div className="flex flex-wrap gap-1.5">
            {levels.map((level) => {
              const active = filters.log_level?.includes(level);
              return (
                <button
                  key={level}
                  className={`rounded-md border px-2 py-1 font-mono text-[11px] uppercase tracking-wide ${active ? "border-brand/50 bg-accent text-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"}`}
                  onClick={() =>
                    onChange({
                      ...filters,
                      log_level: active
                        ? filters.log_level?.filter((item) => item !== level)
                        : [...(filters.log_level ?? []), level],
                    })
                  }
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Actor</span>
          <input
            className="input"
            placeholder="Chris"
            value={filters.actor ?? ""}
            onChange={(event) => onChange({ ...filters, actor: event.target.value || undefined })}
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Message contains</span>
          <input
            className="input"
            placeholder="pricing page"
            value={filters.message ?? ""}
            onChange={(event) => onChange({ ...filters, message: event.target.value || undefined })}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <label className="space-y-1.5 text-sm">
            <span className="text-muted-foreground">Metadata key</span>
            <input
              className="input"
              placeholder="campaign"
              value={filters.metadata_key ?? ""}
              onChange={(event) => onChange({ ...filters, metadata_key: event.target.value || undefined })}
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="text-muted-foreground">Metadata value</span>
            <input
              className="input"
              placeholder="engaged"
              value={filters.metadata_value ?? ""}
              onChange={(event) => onChange({ ...filters, metadata_value: event.target.value || undefined })}
            />
          </label>
        </div>

        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Limit</span>
          <select
            className="input"
            value={filters.limit ?? 25}
            onChange={(event) => onChange({ ...filters, limit: Number(event.target.value) })}
          >
            {[25, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value} events
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
