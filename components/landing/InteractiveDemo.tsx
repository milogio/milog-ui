"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Filter, Pause, Play } from "lucide-react";
import { LOG_EVENTS, SERVICES, type LogEvent, type LogLevel } from "@/components/landing/data";
import { cn } from "@/lib/utils";

const LEVELS: (LogLevel | "all")[] = ["all", "info", "warn", "error", "trace"];
const dotByLevel: Record<LogLevel, string> = {
  info: "bg-level-info",
  warn: "bg-level-warn",
  error: "bg-level-error",
  trace: "bg-level-trace",
  debug: "bg-level-debug",
};
const labelByLevel: Record<LogLevel, string> = {
  info: "text-level-info",
  warn: "text-level-warn",
  error: "text-level-error",
  trace: "text-level-trace",
  debug: "text-level-debug",
};

export function InteractiveDemo() {
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
  const [services, setServices] = useState<string[]>([...SERVICES]);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<"1" | "2" | "4">("1");
  const [cursor, setCursor] = useState(LOG_EVENTS.length);
  const [openId, setOpenId] = useState<string | null>(null);
  const [eps, setEps] = useState(0);
  const epsBuf = useRef<number[]>([]);

  useEffect(() => {
    if (!playing) return;
    const interval = 1400 / Number(speed);
    const timer = setInterval(() => {
      setCursor((current) => current + 1);
      epsBuf.current.push(Date.now());
      const cutoff = Date.now() - 1000;
      epsBuf.current = epsBuf.current.filter((value) => value > cutoff);
      setEps(epsBuf.current.length);
    }, interval);
    return () => clearInterval(timer);
  }, [playing, speed]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") setPlaying(false);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const stream = useMemo(() => {
    const out: LogEvent[] = [];
    for (let i = 0; i < cursor; i += 1) {
      const base = LOG_EVENTS[i % LOG_EVENTS.length];
      out.push({ ...base, id: `${base.id}-${i}` });
    }
    return out.slice(-40);
  }, [cursor]);

  const filtered = stream.filter(
    (event) => (levelFilter === "all" || event.level === levelFilter) && services.includes(event.service),
  );

  const toggleService = (service: string) =>
    setServices((current) =>
      current.includes(service) ? current.filter((item) => item !== service) : [...current, service],
    );

  return (
    <section id="demo" className="border-b border-border">
      <div className="container py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gradient-brand">Sample demo</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
            Explore a simulated event stream.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Filter and inspect generated sample events. This demonstration is not connected to
            production traffic or the authenticated Timeline workspace.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <div className="flex flex-wrap items-center gap-1">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide",
                    levelFilter === level
                      ? "border-foreground/40 bg-accent text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {level}
                </button>
              ))}
            </div>

            <details className="group relative">
              <summary className="flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm">
                <Filter className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">
                  {services.length}/{SERVICES.length} services
                </span>
                <ChevronDown className="h-3.5 w-3.5" />
              </summary>
              <div className="absolute left-0 top-10 z-20 w-56 rounded-md border border-border bg-popover p-2 shadow-soft">
                <div className="px-2 py-1.5 text-sm font-medium">Services</div>
                <div className="my-1 h-px bg-border" />
                {SERVICES.map((service) => (
                  <label
                    key={service}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={services.includes(service)}
                      onChange={() => toggleService(service)}
                      className="h-3.5 w-3.5 accent-brand"
                    />
                    <span className="font-mono text-xs">{service}</span>
                  </label>
                ))}
              </div>
            </details>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <div className="hidden items-center gap-1.5 font-mono text-xs text-muted-foreground sm:flex">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-level-info" />
                <span className="tabular-nums text-foreground">{eps}</span>
                <span>events/sec</span>
              </div>
              <div className="flex h-8 gap-0 rounded-md border border-border bg-background p-0.5">
                {(["1", "2", "4"] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setSpeed(value)}
                    className={cn(
                      "h-7 rounded px-2 font-mono text-[11px] text-muted-foreground",
                      speed === value && "bg-accent text-foreground",
                    )}
                  >
                    {value}x
                  </button>
                ))}
              </div>
              <button
                className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm"
                onClick={() => setPlaying((value) => !value)}
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span className="text-xs">{playing ? "Pause" : "Play"}</span>
              </button>
            </div>
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-16 text-center font-mono text-sm text-muted-foreground">
                No events match these filters.
              </div>
            ) : (
              <ul className="divide-y divide-border/60 font-mono text-[12.5px]">
                {filtered.map((event) => {
                  const open = openId === event.id;
                  return (
                    <li key={event.id} className="animate-row-in">
                      <button
                        onClick={() => setOpenId(open ? null : event.id)}
                        className={cn(
                          "grid w-full grid-cols-[78px_62px_minmax(82px,120px)_minmax(0,1fr)_42px] items-center gap-2 px-4 py-2 text-left hover:bg-accent/40 sm:grid-cols-[90px_70px_120px_1fr_auto] sm:gap-3",
                          open && "bg-accent/30",
                        )}
                      >
                        <span className="text-muted-foreground">{event.ts}</span>
                        <span className={cn("text-[10px] font-semibold uppercase tracking-wide", labelByLevel[event.level])}>
                          <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle", dotByLevel[event.level])} />
                          {event.level}
                        </span>
                        <span className="truncate text-foreground/80">{event.service}</span>
                        <span className="truncate text-foreground">{event.message}</span>
                        <span className="text-right text-xs tabular-nums text-muted-foreground">
                          {event.latencyMs ? `${event.latencyMs}ms` : ""}
                        </span>
                      </button>
                      {open ? (
                        <div className="border-t border-border/60 bg-background/40 px-4 py-3">
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              sample_trace_id: <span className="text-foreground">{event.traceId}</span>
                            </span>
                          </div>
                          <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-card p-3 text-[12px] text-foreground/90">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
