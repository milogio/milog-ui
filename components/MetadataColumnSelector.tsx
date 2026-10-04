"use client";

import { Check, ChevronDown, Settings2 } from "lucide-react";

export function MetadataColumnSelector({
  availableKeys,
  selectedKeys,
  onChange,
}: {
  availableKeys: string[];
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
}) {
  return (
    <details className="group relative">
      <summary className="btn btn-secondary h-8 cursor-pointer list-none px-2.5 text-xs marker:content-none">
        <Settings2 className="size-4 text-brand" aria-hidden="true" />
        <span>Metadata</span>
        <span className="rounded-full bg-muted-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {selectedKeys.length}<span className="hidden sm:inline"> selected</span>
        </span>
        <ChevronDown
          className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div className="absolute left-0 top-10 z-40 w-[min(28rem,calc(100vw-3rem))] rounded-lg border border-border bg-popover p-3 shadow-soft sm:left-auto sm:right-0">
        <div className="mb-3">
          <h2 className="text-sm font-medium text-foreground">Visible metadata</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Choose which metadata fields appear beneath each event.
          </p>
        </div>
        {availableKeys.length ? (
          <div className="flex flex-wrap gap-1.5">
            {availableKeys.map((key) => {
              const active = selectedKeys.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${active ? "Hide" : "Show"} ${key} metadata`}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] ${active ? "border-brand/70 bg-accent text-foreground" : "border-border-strong/70 bg-background text-muted-foreground hover:border-brand/60 hover:bg-accent hover:text-foreground"}`}
                  onClick={() =>
                    onChange(active ? selectedKeys.filter((item) => item !== key) : [...selectedKeys, key])
                  }
                >
                  {active ? <Check className="size-3 text-brand" aria-hidden="true" /> : null}
                  {key}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No metadata fields are available.</p>
        )}
      </div>
    </details>
  );
}
