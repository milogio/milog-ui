"use client";

import { Settings2 } from "lucide-react";

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
    <div className="rounded-lg border border-border bg-card p-3 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Settings2 className="size-4 text-brand" />
        <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Visible metadata
        </h4>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {availableKeys.map((key) => {
          const active = selectedKeys.includes(key);
          return (
            <button
              key={key}
              className={`rounded-md border px-2 py-1 font-mono text-[11px] ${active ? "border-brand/50 bg-accent text-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"}`}
              onClick={() =>
                onChange(active ? selectedKeys.filter((item) => item !== key) : [...selectedKeys, key])
              }
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
