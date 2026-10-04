"use client";

import { useEffect, useRef, useState } from "react";
import { LOG_EVENTS, type LogEvent } from "@/components/landing/data";
import { cn } from "@/lib/utils";

const levelStyles: Record<LogEvent["level"], { dot: string; label: string }> = {
  info: { dot: "bg-level-info", label: "text-level-info" },
  warn: { dot: "bg-level-warn", label: "text-level-warn" },
  error: { dot: "bg-level-error", label: "text-level-error" },
  trace: { dot: "bg-level-trace", label: "text-level-trace" },
  debug: { dot: "bg-level-debug", label: "text-level-debug" },
};

export function TimelinePreview() {
  const [rows, setRows] = useState<LogEvent[]>(LOG_EVENTS.slice(0, 5));
  const idx = useRef(5);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = LOG_EVENTS[idx.current % LOG_EVENTS.length];
      idx.current += 1;
      const stamped: LogEvent = { ...next, id: `${next.id}-${idx.current}` };
      setRows((current) => [...current.slice(-9), stamped]);
      requestAnimationFrame(() => {
        if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
      });
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/80 shadow-soft">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/70" />
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">milog - production</div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-level-info" />
          <span className="font-mono text-[11px] text-muted-foreground">live</span>
        </div>
      </div>
      <div ref={scroller} className="relative max-h-[360px] overflow-hidden">
        <ul className="divide-y divide-border/60 font-mono text-[12px]">
          {rows.map((row) => (
            <li
              key={row.id}
              className="grid grid-cols-[72px_58px_minmax(80px,110px)_minmax(0,1fr)_42px] items-center gap-2 px-4 py-2 animate-row-in hover:bg-accent/40 sm:grid-cols-[80px_60px_110px_1fr_auto] sm:gap-3"
            >
              <span className="text-muted-foreground">{row.ts}</span>
              <span className={cn("text-[10px] font-semibold uppercase tracking-wide", levelStyles[row.level].label)}>
                <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle", levelStyles[row.level].dot)} />
                {row.level}
              </span>
              <span className="truncate text-foreground/80">{row.service}</span>
              <span className="truncate text-foreground">{row.message}</span>
              <span className="text-right tabular-nums text-muted-foreground">{row.latencyMs ? `${row.latencyMs}ms` : ""}</span>
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-card to-transparent" />
      </div>
    </div>
  );
}
