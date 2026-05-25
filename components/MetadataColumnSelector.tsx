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
    <div className="panel-muted rounded-3xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <Settings2 className="size-4 text-secondary" />
        <h4 className="text-sm font-medium text-slate-100">Visible metadata columns</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {availableKeys.map((key) => {
          const active = selectedKeys.includes(key);
          return (
            <button
              key={key}
              className={`rounded-full border px-3 py-1.5 text-xs ${active ? "border-secondary/50 bg-secondary/15 text-secondary" : "border-white/10 bg-white/5 text-muted"}`}
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
