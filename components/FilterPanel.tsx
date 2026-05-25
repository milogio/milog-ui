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
    <div className={`panel rounded-3xl p-5 ${compact ? "" : "lg:sticky lg:top-24 lg:h-fit"}`}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Query</p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">Filters</h3>
        </div>
        <button className="text-sm text-muted hover:text-foreground" onClick={onClear}>
          Clear
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <label className="space-y-2 text-sm">
            <span className="text-muted">Start date</span>
            <input
              className="input"
              type="datetime-local"
              value={filters.start_date ?? ""}
              onChange={(event) => onChange({ ...filters, start_date: event.target.value || undefined })}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted">End date</span>
            <input
              className="input"
              type="datetime-local"
              value={filters.end_date ?? ""}
              onChange={(event) => onChange({ ...filters, end_date: event.target.value || undefined })}
            />
          </label>
        </div>

        <div>
          <span className="mb-2 block text-sm text-muted">Log levels</span>
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => {
              const active = filters.log_level?.includes(level);
              return (
                <button
                  key={level}
                  className={`rounded-full border px-3 py-1.5 text-xs ${active ? "border-primary/50 bg-primary/15 text-indigo-200" : "border-white/10 bg-white/5 text-muted"}`}
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

        <label className="space-y-2 text-sm">
          <span className="text-muted">Actor</span>
          <input
            className="input"
            placeholder="Chris"
            value={filters.actor ?? ""}
            onChange={(event) => onChange({ ...filters, actor: event.target.value || undefined })}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted">Message contains</span>
          <input
            className="input"
            placeholder="pricing page"
            value={filters.message ?? ""}
            onChange={(event) => onChange({ ...filters, message: event.target.value || undefined })}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <label className="space-y-2 text-sm">
            <span className="text-muted">Metadata key</span>
            <input
              className="input"
              placeholder="campaign"
              value={filters.metadata_key ?? ""}
              onChange={(event) => onChange({ ...filters, metadata_key: event.target.value || undefined })}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted">Metadata value</span>
            <input
              className="input"
              placeholder="engaged"
              value={filters.metadata_value ?? ""}
              onChange={(event) => onChange({ ...filters, metadata_value: event.target.value || undefined })}
            />
          </label>
        </div>

        <label className="space-y-2 text-sm">
          <span className="text-muted">Limit</span>
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
