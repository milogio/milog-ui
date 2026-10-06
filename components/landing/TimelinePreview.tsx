"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { LOG_EVENTS, type LogEvent } from "@/components/landing/data";
import { useSamplePlaybackActivity } from "@/hooks/use-sample-playback-activity";
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
  const [playRequested, setPlayRequested] = useState(true);
  const [motionOverride, setMotionOverride] = useState(false);
  const index = useRef(5);
  const scroller = useRef<HTMLDivElement>(null);
  const { containerRef, inView, pageVisible, prefersReducedMotion } =
    useSamplePlaybackActivity<HTMLDivElement>();
  const playing = playRequested && (!prefersReducedMotion || motionOverride);
  const playbackActive = playing && pageVisible && inView;

  useEffect(() => {
    if (!playbackActive) return;

    const timer = window.setInterval(() => {
      const next = LOG_EVENTS[index.current % LOG_EVENTS.length];
      index.current += 1;
      const stamped: LogEvent = { ...next, id: `${next.id}-preview-${index.current}` };
      setRows((current) => [...current.slice(-7), stamped]);
      window.requestAnimationFrame(() => {
        if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
      });
    }, 1800);

    return () => window.clearInterval(timer);
  }, [playbackActive]);

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl border border-border bg-card/80 shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="hidden items-center gap-1.5 sm:flex" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/70" />
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">simulated sample stream</div>
        <button
          type="button"
          aria-pressed={playing}
          aria-label={playing ? "Pause sample preview" : "Play sample preview"}
          onClick={() => {
            setMotionOverride(true);
            setPlayRequested(!playing);
          }}
          className="marketing-control inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs"
        >
          <span className={cn("h-2 w-2 rounded-full bg-level-info", playbackActive && "animate-pulse-dot")} aria-hidden="true" />
          {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
          {playing ? "Pause" : "Play"}
        </button>
      </div>
      <div ref={scroller} className="relative h-[220px] overflow-hidden" aria-label="Simulated sample events">
        <ul className="divide-y divide-border/60 font-mono text-[12px]">
          {rows.map((row) => (
            <li
              key={row.id}
              className="grid grid-cols-[74px_58px_minmax(0,1fr)_42px] items-center gap-x-2 gap-y-1 px-4 py-2 animate-row-in hover:bg-accent/40 sm:grid-cols-[80px_60px_110px_minmax(0,1fr)_42px] sm:gap-x-3"
            >
              <span className="text-muted-foreground">{row.ts}</span>
              <span className={cn("text-[10px] font-semibold uppercase tracking-wide", levelStyles[row.level].label)}>
                <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle", levelStyles[row.level].dot)} />
                {row.level}
              </span>
              <span className="min-w-0 truncate text-foreground/80">{row.service}</span>
              <span className="col-span-3 row-start-2 min-w-0 break-words text-foreground sm:col-span-1 sm:col-start-4 sm:row-start-1 sm:truncate">
                {row.message}
              </span>
              <span className="col-start-4 row-start-2 text-right tabular-nums text-muted-foreground sm:col-start-5 sm:row-start-1">
                {row.latencyMs ? `${row.latencyMs}ms` : ""}
              </span>
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-card to-transparent" />
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {playbackActive ? "Sample preview playing." : "Sample preview paused."}
      </span>
    </div>
  );
}
