"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Filter, Pause, Play, RotateCcw } from "lucide-react";
import { LOG_EVENTS, SERVICES, type LogEvent, type LogLevel } from "@/components/landing/data";
import { useSamplePlaybackActivity } from "@/hooks/use-sample-playback-activity";
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
  const [servicesOpen, setServicesOpen] = useState(false);
  const [playRequested, setPlayRequested] = useState(true);
  const [motionOverride, setMotionOverride] = useState(false);
  const [speed, setSpeed] = useState<"1" | "2" | "4">("1");
  const [stream, setStream] = useState<LogEvent[]>(LOG_EVENTS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [eps, setEps] = useState(0);
  const streamIndex = useRef(LOG_EVENTS.length);
  const epsBuffer = useRef<number[]>([]);
  const servicesMenu = useRef<HTMLDetailsElement>(null);
  const servicesSummary = useRef<HTMLElement>(null);
  const { containerRef, inView, pageVisible, prefersReducedMotion } =
    useSamplePlaybackActivity<HTMLElement>();
  const playing = playRequested && (!prefersReducedMotion || motionOverride);
  const playbackActive = playing && pageVisible && inView && openId === null;

  useEffect(() => {
    if (!playbackActive) {
      epsBuffer.current = [];
      return;
    }

    const timer = window.setInterval(() => {
      const nextIndex = streamIndex.current;
      const base = LOG_EVENTS[nextIndex % LOG_EVENTS.length];
      streamIndex.current += 1;
      setStream((current) => [
        ...current.slice(-39),
        { ...base, id: `${base.id}-stream-${nextIndex}` },
      ]);

      const now = Date.now();
      epsBuffer.current = [...epsBuffer.current, now].filter((value) => value > now - 1000);
      setEps(epsBuffer.current.length);
    }, 1400 / Number(speed));

    return () => {
      window.clearInterval(timer);
      epsBuffer.current = [];
    };
  }, [playbackActive, speed]);

  useEffect(() => {
    if (!servicesOpen) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!servicesMenu.current?.contains(event.target as Node)) setServicesOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setServicesOpen(false);
      servicesSummary.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [servicesOpen]);

  const filtered = stream.filter(
    (event) => (levelFilter === "all" || event.level === levelFilter) && services.includes(event.service),
  );
  const filtersActive = levelFilter !== "all" || services.length !== SERVICES.length;

  const toggleService = (service: string) =>
    setServices((current) =>
      current.includes(service) ? current.filter((item) => item !== service) : [...current, service],
    );

  const resetFilters = () => {
    setLevelFilter("all");
    setServices([...SERVICES]);
  };

  const toggleEvent = (eventId: string) => {
    const willOpen = openId !== eventId;
    setOpenId(willOpen ? eventId : null);
    if (willOpen) setPlayRequested(false);
  };

  const togglePlayback = () => {
    if (!playing) {
      setOpenId(null);
      setMotionOverride(true);
    }
    setPlayRequested(!playing);
  };

  const playbackLabel = openId
    ? "Playback paused while event details are open."
    : playbackActive
      ? `Simulated playback running at ${speed}×.`
      : "Simulated playback paused.";

  return (
    <section id="demo" ref={containerRef}>
      <div className="container marketing-section">
        <div className="marketing-copy">
          <p className="marketing-section-label text-gradient-brand">Sample demo</p>
          <h2 className="marketing-heading mt-3 font-semibold">Explore a simulated event stream.</h2>
          <p className="marketing-prose mt-4">
            Choose a sample severity, open an event, and inspect its generated payload. This
            demonstration is not connected to production traffic or the authenticated Timeline
            workspace.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Sample severity">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={levelFilter === level}
                  aria-label={level === "all" ? "Show all sample severities" : `Show ${level} sample events`}
                  onClick={() => setLevelFilter(level)}
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide",
                    levelFilter === level
                      ? "border-foreground/40 bg-accent text-foreground"
                      : "marketing-control text-muted-foreground hover:text-foreground",
                  )}
                >
                  {level}
                </button>
              ))}
            </div>

            <details
              ref={servicesMenu}
              open={servicesOpen}
              onToggle={(event) => setServicesOpen(event.currentTarget.open)}
              className="group relative"
            >
              <summary
                ref={servicesSummary}
                aria-expanded={servicesOpen}
                className="marketing-control flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-md border bg-background px-3 text-sm"
              >
                <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="font-mono text-xs">
                  {services.length}/{SERVICES.length} sample services
                </span>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </summary>
              <div className="absolute left-0 top-10 z-20 w-60 rounded-md border border-border bg-popover p-2 shadow-soft">
                <div className="px-2 py-1.5 text-sm font-medium">Sample services</div>
                <div className="my-1 h-px bg-border" />
                {SERVICES.map((service) => (
                  <label key={service} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-accent">
                    <input
                      type="checkbox"
                      aria-label={service}
                      checked={services.includes(service)}
                      onChange={() => toggleService(service)}
                      className="h-3.5 w-3.5 accent-brand"
                    />
                    <span className="font-mono text-xs">{service}</span>
                  </label>
                ))}
              </div>
            </details>

            <button
              type="button"
              onClick={resetFilters}
              disabled={!filtersActive}
              className="marketing-control inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-xs disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset filters
            </button>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <div className="hidden items-center gap-1.5 font-mono text-xs text-muted-foreground sm:flex">
                <span className={cn("h-1.5 w-1.5 rounded-full bg-level-info", playbackActive && "animate-pulse-dot")} />
                <span className="tabular-nums text-foreground">{playbackActive ? eps : 0}</span>
                <span>sample events/sec</span>
              </div>
              <div className="marketing-control flex h-8 gap-0 rounded-md border bg-background p-0.5" role="group" aria-label="Sample playback speed">
                {(["1", "2", "4"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={speed === value}
                    aria-label={`${value}× playback speed`}
                    onClick={() => setSpeed(value)}
                    className={cn(
                      "h-7 rounded px-2 font-mono text-[11px] text-muted-foreground",
                      speed === value && "bg-accent text-foreground",
                    )}
                  >
                    {value}×
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-pressed={playing}
                aria-label={playing ? "Pause simulated playback" : "Play simulated playback"}
                className="marketing-control flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-sm"
                onClick={togglePlayback}
              >
                {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
                <span className="text-xs">{playing ? "Pause" : "Play"}</span>
              </button>
              <span className="sr-only" role="status" aria-live="polite">{playbackLabel}</span>
            </div>
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-4 py-14 text-center">
                <p className="font-mono text-sm text-muted-foreground">No sample events match these filters.</p>
                <button type="button" onClick={resetFilters} className="marketing-control rounded-md border bg-background px-3 py-2 text-sm">
                  Reset sample filters
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-border/60 font-mono text-[12.5px]">
                {filtered.map((event) => {
                  const open = openId === event.id;
                  const detailsId = `sample-event-details-${event.id}`;
                  return (
                    <li key={event.id} className="animate-row-in">
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={detailsId}
                        aria-label={`Inspect sample event: ${event.message}`}
                        onClick={() => toggleEvent(event.id)}
                        className={cn(
                          "grid w-full grid-cols-[74px_58px_minmax(0,1fr)_20px] items-center gap-x-2 gap-y-1 px-4 py-2.5 text-left hover:bg-accent/40 sm:grid-cols-[90px_70px_120px_minmax(0,1fr)_42px_20px] sm:gap-x-3",
                          open && "bg-accent/30",
                        )}
                      >
                        <span className="text-muted-foreground">{event.ts}</span>
                        <span className={cn("text-[10px] font-semibold uppercase tracking-wide", labelByLevel[event.level])}>
                          <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle", dotByLevel[event.level])} />
                          {event.level}
                        </span>
                        <span className="min-w-0 truncate text-foreground/80">{event.service}</span>
                        <span className="col-span-3 row-start-2 min-w-0 break-words text-foreground sm:col-span-1 sm:col-start-4 sm:row-start-1 sm:truncate">
                          {event.message}
                        </span>
                        <span className="col-start-4 row-start-2 text-right text-xs tabular-nums text-muted-foreground sm:col-start-5 sm:row-start-1">
                          {event.latencyMs ? `${event.latencyMs}ms` : ""}
                        </span>
                        {open ? (
                          <ChevronDown className="col-start-4 row-start-1 h-4 w-4 justify-self-end text-muted-foreground sm:col-start-6" aria-hidden="true" />
                        ) : (
                          <ChevronRight className="col-start-4 row-start-1 h-4 w-4 justify-self-end text-muted-foreground sm:col-start-6" aria-hidden="true" />
                        )}
                      </button>
                      {open ? (
                        <div id={detailsId} className="border-t border-border/60 bg-background/40 px-4 py-3">
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              sample_trace_id: <span className="break-all text-foreground">{event.traceId}</span>
                            </span>
                          </div>
                          <pre className="mt-3 max-w-full overflow-x-auto rounded-md border border-border bg-card p-3 text-[12px] text-foreground/90">
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
