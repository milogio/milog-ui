"use client";

import { useState } from "react";
import type { TimelineFilters } from "@/lib/types";

export function AlertBuilder({
  filters,
  onCreate,
}: {
  filters: TimelineFilters;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <div className="panel-muted rounded-3xl p-4">
      <h4 className="text-sm font-medium text-slate-100">Create alert from current filters</h4>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          className="input flex-1"
          value={name}
          placeholder={filters.message ? `Alert for "${filters.message}"` : "High-intent leads"}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            onCreate(name || filters.message || "MiLog alert");
            setName("");
          }}
        >
          Save alert
        </button>
      </div>
    </div>
  );
}
