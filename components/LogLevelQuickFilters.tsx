"use client";

import { LogLevelBadge } from "@/components/LogLevelBadge";
import { LOG_LEVELS } from "@/lib/logLevels";
import type { LogLevel, TimelineFilters } from "@/lib/types";

export function LogLevelQuickFilters({
  filters,
  onChange,
  disabled = false,
}: {
  filters: TimelineFilters;
  onChange: (filters: TimelineFilters) => void;
  disabled?: boolean;
}) {
  const selected = filters.log_level ?? [];

  function toggle(level: LogLevel) {
    const next = selected.includes(level)
      ? selected.filter((value) => value !== level)
      : LOG_LEVELS.filter((value) => value === level || selected.includes(value));
    onChange({ ...filters, log_level: next.length ? next : undefined });
  }

  return (
    <fieldset className="flex flex-wrap items-center gap-2" aria-label="Quick log-level filters">
      <legend className="sr-only">Log level</legend>
      <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground" aria-hidden="true">
        Log level
      </span>
      {LOG_LEVELS.map((level) => {
        const active = selected.includes(level);
        return (
          <button
            key={level}
            type="button"
            aria-label={`Filter by ${level} log level`}
            aria-pressed={active}
            className="rounded-full disabled:cursor-not-allowed disabled:opacity-40"
            disabled={disabled}
            onClick={() => toggle(level)}
          >
            <LogLevelBadge level={level} active={active} selected={active} />
          </button>
        );
      })}
    </fieldset>
  );
}
