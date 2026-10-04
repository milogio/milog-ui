"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Plus, SlidersHorizontal, X } from "lucide-react";
import type { TimelineFilters } from "@/lib/types";
import { TIMELINE_FILTERS, timelineFilterDefinition, type TimelineFilterKey } from "@/lib/timelineFilters";

export function QueryFilterBar({
  filters,
  onChange,
  onAdvancedFilters,
  loadedEventCount,
  children,
}: {
  filters: TimelineFilters;
  onChange: (filters: TimelineFilters) => void;
  onAdvancedFilters?: () => void;
  loadedEventCount?: number;
  children?: React.ReactNode;
}) {
  const [editingKey, setEditingKey] = useState<TimelineFilterKey>();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const active = TIMELINE_FILTERS.filter(({ key }) => filters[key]);
  const available = TIMELINE_FILTERS.filter(({ key }) => !filters[key]);
  const selectedLogLevels = filters.log_level ?? [];
  const hasActiveFilters = active.length > 0 || selectedLogLevels.length > 0;
  const querySummary = selectedLogLevels.length
    ? active.length
      ? `${active.length} exact ${active.length === 1 ? "filter" : "filters"} must match · ${selectedLogLevels.length} ${selectedLogLevels.length === 1 ? "level" : "levels"} match any`
      : `${selectedLogLevels.length} ${selectedLogLevels.length === 1 ? "level" : "levels"} match any`
    : active.length
      ? `${active.length} exact ${active.length === 1 ? "filter" : "filters"} must match`
      : "No restrictions";

  useEffect(() => {
    if (editingKey) inputRef.current?.focus();
  }, [editingKey]);

  function beginEditing(key: TimelineFilterKey) {
    setEditingKey(key);
    setValue(filters[key] ?? "");
  }

  function cancelEditing() {
    setEditingKey(undefined);
    setValue("");
  }

  function commitFilter() {
    if (!editingKey) return;
    const nextValue = value.trim();
    onChange({ ...filters, [editingKey]: nextValue || undefined });
    cancelEditing();
  }

  const editingDefinition = editingKey ? timelineFilterDefinition(editingKey) : undefined;

  return (
    <section className="rounded-lg border border-border bg-card/80 p-2 shadow-soft" aria-label="Timeline query">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-h-10 min-w-0 flex-1 flex-wrap items-center gap-2">
          {active.map(({ key, label }) => (
            <span key={key} className="inline-flex h-8 max-w-full items-center rounded-md border border-border bg-background font-mono text-xs text-foreground">
              <button
                className="flex min-w-0 items-center gap-1.5 px-2.5 py-1.5 hover:bg-accent"
                onClick={() => beginEditing(key)}
                aria-label={`Edit ${label} filter`}
              >
                <span className="shrink-0 text-muted-foreground">{label}:</span>
                <span className="truncate">{filters[key]}</span>
              </button>
              <button
                className="mr-1 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => onChange({ ...filters, [key]: undefined })}
                aria-label={`Remove ${label} filter`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}

          {editingDefinition ? (
            <form
              className="flex min-w-60 flex-1 items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                commitFilter();
              }}
            >
              <span className="shrink-0 pl-1 font-mono text-xs text-muted-foreground">{editingDefinition.label}:</span>
              <input
                ref={inputRef}
                className="min-w-24 flex-1 bg-transparent px-1 py-2 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground"
                aria-label={`${editingDefinition.label} filter value`}
                maxLength={255}
                placeholder={editingDefinition.placeholder}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") cancelEditing();
                }}
              />
              <button className="rounded p-1.5 text-brand hover:bg-accent" aria-label={`Apply ${editingDefinition.label} filter`}>
                <Check className="size-4" />
              </button>
              <button type="button" className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" onClick={cancelEditing} aria-label="Cancel filter editing">
                <X className="size-4" />
              </button>
            </form>
          ) : available.length ? (
            <label className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground">
              <Plus className="size-3.5" />
              <span className="sr-only">Add filter</span>
              <select
                className="cursor-pointer appearance-none bg-transparent pr-1 font-mono outline-none"
                aria-label="Add filter"
                value=""
                onChange={(event) => beginEditing(event.target.value as TimelineFilterKey)}
              >
                <option value="" disabled>Add filter…</option>
                {available.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
          ) : null}

        </div>
        {onAdvancedFilters ? (
          <button className="btn btn-secondary h-8 shrink-0 px-2.5 text-xs" onClick={onAdvancedFilters}>
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Advanced filters
          </button>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 px-1 pt-2">
        {children}
        <div className="ml-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {loadedEventCount !== undefined ? (
            <output
              className="font-mono text-foreground"
              aria-live="polite"
              title="Count of events currently loaded, not the total number of matches"
            >
              {loadedEventCount} {loadedEventCount === 1 ? "event" : "events"} loaded
            </output>
          ) : null}
          <span>{querySummary}</span>
          {hasActiveFilters ? (
            <button className="font-mono text-xs text-muted-foreground hover:text-foreground" onClick={() => onChange({})}>
              Clear all
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
