# MiLog — UI Replication Spec for Next.js

A complete blueprint to rebuild the MiLog demo in a Next.js (App Router) production app. Everything you need: design tokens, component source for the timeline (the centerpiece), and section-by-section blueprints with exact copy.

---

## 1. Stack & Setup

**Source stack:** Vite + React 18 + TypeScript + Tailwind v3 + shadcn/ui
**Target stack:** Next.js 14+ App Router + Tailwind v3 + shadcn/ui

### Dependencies

```bash
npm i tailwindcss tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react
npx shadcn@latest init
npx shadcn@latest add button tabs dropdown-menu toggle-group
```

### Fonts (`app/layout.tsx`)

Replace the Google `<link>` tag from the demo's `index.html` with `next/font`:

```tsx
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono  = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${mono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

export const metadata = {
  title: "MiLog — The timeline your logs deserve",
  description:
    "MiLog is a developer-first logging platform with a real-time event timeline, structured queries, and SDKs for every stack.",
};
```

> Add `'use client'` to any component using `useState`/`useEffect`: `TimelinePreview`, `InteractiveDemo`, `CodeSection`, `Nav` (if you add interactivity). The rest are server components.

---

## 2. Design Tokens

### `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* MiLog — dark, developer-focused. All values HSL. */
    --background: 230 25% 5%;
    --foreground: 210 30% 96%;

    --card: 230 22% 7%;
    --card-foreground: 210 30% 96%;
    --popover: 230 22% 7%;
    --popover-foreground: 210 30% 96%;

    --primary: 210 30% 96%;
    --primary-foreground: 230 25% 5%;
    --secondary: 230 18% 12%;
    --secondary-foreground: 210 30% 96%;

    --muted: 230 18% 12%;
    --muted-foreground: 220 12% 60%;
    --accent: 230 18% 14%;
    --accent-foreground: 210 30% 96%;
    --destructive: 0 72% 55%;
    --destructive-foreground: 210 30% 98%;

    --border: 230 18% 14%;
    --input: 230 18% 14%;
    --ring: 230 90% 65%;
    --radius: 0.75rem;

    /* Brand */
    --brand: 230 90% 65%;
    --brand-foreground: 210 30% 98%;
    --accent-from: 230 90% 65%;
    --accent-to: 190 95% 55%;

    /* Log levels */
    --level-info:  200 85% 60%;
    --level-warn:   38 95% 60%;
    --level-error:   0 80% 62%;
    --level-trace: 270 80% 70%;
    --level-debug: 150 60% 55%;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "cv11", "ss01", "ss03";
  }
}

@layer utilities {
  .bg-grid {
    background-image:
      linear-gradient(to right, hsl(var(--border) / 0.6) 1px, transparent 1px),
      linear-gradient(to bottom, hsl(var(--border) / 0.6) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%);
  }
  .bg-radial-glow {
    background: radial-gradient(ellipse 60% 50% at 50% 0%,
      hsl(var(--brand) / 0.18), transparent 70%);
  }
  .text-gradient-brand {
    background: linear-gradient(135deg, hsl(var(--accent-from)), hsl(var(--accent-to)));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .bg-gradient-brand {
    background: linear-gradient(135deg, hsl(var(--accent-from)), hsl(var(--accent-to)));
  }
  .ring-gradient-brand { position: relative; }
  .ring-gradient-brand::before {
    content: "";
    position: absolute; inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, hsl(var(--accent-from)), hsl(var(--accent-to)));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
  }
  .shadow-soft {
    box-shadow:
      0 1px 0 hsl(var(--foreground) / 0.04) inset,
      0 20px 60px -20px hsl(0 0% 0% / 0.6);
  }
  .shadow-glow {
    box-shadow:
      0 0 0 1px hsl(var(--brand) / 0.25),
      0 20px 60px -10px hsl(var(--brand) / 0.35);
  }
}

@keyframes timeline-row-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-row-in { animation: timeline-row-in 0.35s ease-out both; }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(0.85); }
}
.animate-pulse-dot { animation: pulse-dot 1.6s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .animate-row-in, .animate-pulse-dot { animation: none !important; }
}
```

### `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
          from: "hsl(var(--accent-from))",
          to:   "hsl(var(--accent-to))",
        },
        level: {
          info:  "hsl(var(--level-info))",
          warn:  "hsl(var(--level-warn))",
          error: "hsl(var(--level-error))",
          trace: "hsl(var(--level-trace))",
          debug: "hsl(var(--level-debug))",
        },
        primary:     { DEFAULT: "hsl(var(--primary))",     foreground: "hsl(var(--primary-foreground))" },
        secondary:   { DEFAULT: "hsl(var(--secondary))",   foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted:       { DEFAULT: "hsl(var(--muted))",       foreground: "hsl(var(--muted-foreground))" },
        accent:      { DEFAULT: "hsl(var(--accent))",      foreground: "hsl(var(--accent-foreground))" },
        popover:     { DEFAULT: "hsl(var(--popover))",     foreground: "hsl(var(--popover-foreground))" },
        card:        { DEFAULT: "hsl(var(--card))",        foreground: "hsl(var(--card-foreground))" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", '"JetBrains Mono"', "ui-monospace", "Menlo", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

---

## 3. Timeline Components (the core)

### `components/landing/data.ts`

```ts
export type LogLevel = "info" | "warn" | "error" | "trace" | "debug";

export interface LogEvent {
  id: string;
  ts: string; // HH:MM:SS.mmm
  level: LogLevel;
  service: string;
  message: string;
  latencyMs?: number;
  traceId: string;
  payload: Record<string, unknown>;
}

export const SERVICES = ["api-gateway", "auth-svc", "billing", "checkout", "worker"] as const;

function ts(seconds: number) {
  const base = new Date(Date.UTC(2026, 4, 1, 14, 22, 0));
  base.setMilliseconds(base.getMilliseconds() + seconds * 1000);
  const h  = String(base.getUTCHours()).padStart(2, "0");
  const m  = String(base.getUTCMinutes()).padStart(2, "0");
  const s  = String(base.getUTCSeconds()).padStart(2, "0");
  const ms = String(base.getUTCMilliseconds()).padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}

export const LOG_EVENTS: LogEvent[] = [
  { id: "e1",  ts: ts(0),   level: "info",  service: "api-gateway", message: "GET /v1/invoices 200",                   latencyMs: 42,  traceId: "tr_8f1c2a", payload: { method: "GET",  path: "/v1/invoices",  status: 200, userId: "usr_193" } },
  { id: "e2",  ts: ts(0.4), level: "trace", service: "auth-svc",    message: "Token verified for usr_193",                              traceId: "tr_8f1c2a", payload: { userId: "usr_193", scope: ["read:invoices"] } },
  { id: "e3",  ts: ts(0.9), level: "info",  service: "billing",     message: "Invoice in_42a generated",               latencyMs: 118, traceId: "tr_8f1c2a", payload: { invoiceId: "in_42a", amount: 2900, currency: "USD" } },
  { id: "e4",  ts: ts(1.6), level: "warn",  service: "checkout",    message: "Retrying payment intent (attempt 2)",                    traceId: "tr_55d910", payload: { intentId: "pi_771", attempt: 2, reason: "network_timeout" } },
  { id: "e5",  ts: ts(2.1), level: "error", service: "checkout",    message: "Payment intent failed: card_declined",                   traceId: "tr_55d910", payload: { intentId: "pi_771", code: "card_declined", declineCode: "insufficient_funds" } },
  { id: "e6",  ts: ts(2.7), level: "info",  service: "worker",      message: "Webhook delivered to acme.com",          latencyMs: 213, traceId: "tr_a01f3c", payload: { event: "invoice.paid", url: "https://acme.com/hooks", status: 200 } },
  { id: "e7",  ts: ts(3.3), level: "debug", service: "api-gateway", message: "Cache hit for /v1/customers/cus_88",                     traceId: "tr_b22e4d", payload: { key: "/v1/customers/cus_88", ttlMs: 30000 } },
  { id: "e8",  ts: ts(4.0), level: "info",  service: "auth-svc",    message: "Issued session for usr_204",             latencyMs: 31,  traceId: "tr_c91842", payload: { userId: "usr_204", expiresIn: 3600 } },
  { id: "e9",  ts: ts(4.6), level: "warn",  service: "billing",     message: "Tax rate fallback applied (region: EU-FR)",              traceId: "tr_c91842", payload: { region: "EU-FR", rate: 0.2 } },
  { id: "e10", ts: ts(5.2), level: "info",  service: "api-gateway", message: "POST /v1/charges 201",                   latencyMs: 96,  traceId: "tr_c91842", payload: { method: "POST", path: "/v1/charges", status: 201 } },
  { id: "e11", ts: ts(5.9), level: "error", service: "worker",      message: "Job failed: send_receipt_email",                         traceId: "tr_d44a91", payload: { jobId: "job_998", error: "SMTPConnectError" } },
  { id: "e12", ts: ts(6.4), level: "trace", service: "billing",     message: "Recomputed MRR for tenant ten_77",                       traceId: "tr_e51b22", payload: { tenantId: "ten_77", mrr: 18420 } },
];
```

### `components/landing/TimelinePreview.tsx`

Auto-streaming hero preview. New row every 1800ms; keeps last 10. Mark as client component.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { LOG_EVENTS, LogEvent } from "./data";
import { cn } from "@/lib/utils";

const levelStyles: Record<LogEvent["level"], { dot: string; label: string }> = {
  info:  { dot: "bg-level-info",  label: "text-level-info"  },
  warn:  { dot: "bg-level-warn",  label: "text-level-warn"  },
  error: { dot: "bg-level-error", label: "text-level-error" },
  trace: { dot: "bg-level-trace", label: "text-level-trace" },
  debug: { dot: "bg-level-debug", label: "text-level-debug" },
};

export function TimelinePreview() {
  const [rows, setRows] = useState<LogEvent[]>(LOG_EVENTS.slice(0, 5));
  const idx = useRef(5);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      const next = LOG_EVENTS[idx.current % LOG_EVENTS.length];
      idx.current += 1;
      const stamped: LogEvent = { ...next, id: `${next.id}-${idx.current}` };
      setRows((r) => [...r.slice(-9), stamped]);
      requestAnimationFrame(() => {
        if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
      });
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative rounded-2xl border border-border bg-card/80 shadow-soft overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">milog • production</div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-level-info animate-pulse-dot" />
          <span className="font-mono text-[11px] text-muted-foreground">live</span>
        </div>
      </div>
      <div ref={scroller} className="relative max-h-[360px] overflow-hidden">
        <ul className="divide-y divide-border/60 font-mono text-[12px]">
          {rows.map((r) => (
            <li key={r.id}
              className="grid grid-cols-[80px_60px_110px_1fr_auto] items-center gap-3 px-4 py-2 animate-row-in hover:bg-accent/40">
              <span className="text-muted-foreground">{r.ts}</span>
              <span className={cn("uppercase tracking-wide text-[10px] font-semibold", levelStyles[r.level].label)}>
                <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle", levelStyles[r.level].dot)} />
                {r.level}
              </span>
              <span className="text-foreground/80 truncate">{r.service}</span>
              <span className="text-foreground truncate">{r.message}</span>
              <span className="text-muted-foreground tabular-nums">{r.latencyMs ? `${r.latencyMs}ms` : ""}</span>
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-card to-transparent" />
      </div>
    </div>
  );
}
```

### `components/landing/InteractiveDemo.tsx`

Full timeline: level chip filter, services dropdown, play/pause, 1x/2x/4x speed, events/sec counter, expandable JSON rows.

```tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { LOG_EVENTS, LogEvent, LogLevel, SERVICES } from "./data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChevronDown, Pause, Play, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const LEVELS: (LogLevel | "all")[] = ["all", "info", "warn", "error", "trace"];
const dotByLevel:   Record<LogLevel, string> = { info: "bg-level-info",   warn: "bg-level-warn",   error: "bg-level-error",   trace: "bg-level-trace",   debug: "bg-level-debug" };
const labelByLevel: Record<LogLevel, string> = { info: "text-level-info", warn: "text-level-warn", error: "text-level-error", trace: "text-level-trace", debug: "text-level-debug" };

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
    const t = setInterval(() => {
      setCursor((c) => c + 1);
      epsBuf.current.push(Date.now());
      const cutoff = Date.now() - 1000;
      epsBuf.current = epsBuf.current.filter((t) => t > cutoff);
      setEps(epsBuf.current.length);
    }, interval);
    return () => clearInterval(t);
  }, [playing, speed]);

  const stream = useMemo(() => {
    const out: LogEvent[] = [];
    for (let i = 0; i < cursor; i++) {
      const base = LOG_EVENTS[i % LOG_EVENTS.length];
      out.push({ ...base, id: `${base.id}-${i}` });
    }
    return out.slice(-40);
  }, [cursor]);

  const filtered = stream.filter(
    (e) => (levelFilter === "all" || e.level === levelFilter) && services.includes(e.service),
  );

  const toggleService = (s: string) =>
    setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <section id="demo" className="border-b border-border">
      <div className="container py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gradient-brand">Live demo</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
            Replay any incident, frame by frame.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Filter, scrub, and dive into any event. The same UI you'll use every day —
            try it right here, with sample production traffic.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          {/* toolbar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-1">
              {LEVELS.map((lv) => (
                <button key={lv} onClick={() => setLevelFilter(lv)}
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors",
                    levelFilter === lv
                      ? "border-foreground/40 bg-accent text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}>
                  {lv}
                </button>
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 border-border bg-background">
                  <Filter className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs">{services.length}/{SERVICES.length} services</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Services</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SERVICES.map((s) => (
                  <DropdownMenuCheckboxItem key={s} checked={services.includes(s)} onCheckedChange={() => toggleService(s)}>
                    <span className="font-mono text-xs">{s}</span>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-level-info animate-pulse-dot" />
                <span className="tabular-nums text-foreground">{eps}</span>
                <span>events/sec</span>
              </div>
              <ToggleGroup type="single" value={speed}
                onValueChange={(v) => v && setSpeed(v as "1" | "2" | "4")}
                className="h-8 gap-0 rounded-md border border-border bg-background p-0.5">
                {(["1", "2", "4"] as const).map((s) => (
                  <ToggleGroupItem key={s} value={s}
                    className="h-7 px-2 font-mono text-[11px] data-[state=on]:bg-accent">
                    {s}x
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <Button size="sm" variant="outline"
                className="h-8 gap-1.5 border-border bg-background"
                onClick={() => setPlaying((p) => !p)}>
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span className="text-xs">{playing ? "Pause" : "Play"}</span>
              </Button>
            </div>
          </div>

          {/* timeline */}
          <div className="max-h-[480px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-16 text-center font-mono text-sm text-muted-foreground">
                No events match these filters.
              </div>
            ) : (
              <ul className="divide-y divide-border/60 font-mono text-[12.5px]">
                {filtered.map((e) => {
                  const open = openId === e.id;
                  return (
                    <li key={e.id} className="animate-row-in">
                      <button onClick={() => setOpenId(open ? null : e.id)}
                        className={cn(
                          "w-full grid grid-cols-[90px_70px_120px_1fr_auto] items-center gap-3 px-4 py-2 text-left hover:bg-accent/40",
                          open && "bg-accent/30",
                        )}>
                        <span className="text-muted-foreground">{e.ts}</span>
                        <span className={cn("uppercase tracking-wide text-[10px] font-semibold", labelByLevel[e.level])}>
                          <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle", dotByLevel[e.level])} />
                          {e.level}
                        </span>
                        <span className="text-foreground/80 truncate">{e.service}</span>
                        <span className="text-foreground truncate">{e.message}</span>
                        <span className="text-muted-foreground tabular-nums text-xs">
                          {e.latencyMs ? `${e.latencyMs}ms` : ""}
                        </span>
                      </button>
                      {open && (
                        <div className="border-t border-border/60 bg-background/40 px-4 py-3">
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
                            <span>trace_id: <span className="text-foreground">{e.traceId}</span></span>
                            <a href="#" className="text-gradient-brand hover:underline">View full trace →</a>
                          </div>
                          <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-card p-3 text-[12px] text-foreground/90">
{JSON.stringify(e.payload, null, 2)}
                          </pre>
                        </div>
                      )}
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
```

**Behavior notes**

- Streaming interval = `1400 / speed` ms. At 4x it ticks every 350ms.
- `eps` counter is a rolling 1-second window over insertion timestamps.
- Consider pausing on `document.visibilitychange === "hidden"` to save CPU on background tabs.

---

## 4. Section Blueprints

### 4.1 Nav (`components/landing/Nav.tsx`)

Sticky, blurred, 56px tall, bottom border. Links: Features, Demo, Pricing, Docs, API Reference. Right side: "Sign in" ghost + "Start free" gradient button.

```tsx
<header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
  <div className="container flex h-14 items-center justify-between">
    <Logo />
    <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
      {/* href="#features" "#demo" "#pricing" "#docs" "#api" */}
    </nav>
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
      <Button size="sm" className="bg-gradient-brand text-brand-foreground hover:opacity-90">Start free</Button>
    </div>
  </div>
</header>
```

### 4.2 Logo

```tsx
<div className="flex items-center gap-2">
  <div className="relative h-7 w-7 rounded-md bg-gradient-brand shadow-glow">
    <div className="absolute inset-[3px] rounded-[5px] bg-background flex items-center justify-center">
      <span className="font-mono text-[11px] font-bold text-gradient-brand">M</span>
    </div>
  </div>
  <span className="text-base font-semibold tracking-tight">MiLog</span>
</div>
```

### 4.3 Hero

Two-column on `lg`; `bg-grid` + `bg-radial-glow` layered behind. Right column has a `-inset-4` blurred gradient halo behind the `<TimelinePreview/>`.

- **Pill badge:** `v2.0 — Real-time streaming is here`
- **Headline:** `The timeline your` ⏎ `logs deserve.` (last 2 words in `text-gradient-brand`)
- **Subhead:** `MiLog is a developer-first logging platform. Stream structured events, correlate traces, and replay incidents on a beautiful, queryable timeline.`
- **CTAs:** `Get started — it's free` (gradient) · `View on GitHub` (outline)
- **Below CTAs (mono):** `$ npm i @milog/sdk`

### 4.4 TrustedBy

Single thin strip. Centered uppercase eyebrow `Trusted by engineering teams at`, then lowercase mono names with `opacity-70`: `acme · vercel · linear · stripe · plaid · supabase`.

### 4.5 Features (6 cards)

Grid `md:grid-cols-2 lg:grid-cols-3`. Use a hairline grid via `gap-px bg-border` wrapper + each cell `bg-card`. Each card: 36×36 bordered icon tile, title (`text-base font-semibold`), description (`text-sm text-muted-foreground`).

**Eyebrow:** `Features` · **Headline:** `Everything you need to debug production.` · **Subhead:** `A single platform for logs, traces, and events — designed by developers who got tired of duct-taping observability tools together.`

| Icon (lucide) | Title | Description |
|---|---|---|
| `Activity` | Real-time streaming | Sub-second ingest. Watch events land on the timeline as they happen, with backpressure handled for you. |
| `Boxes` | Structured events | First-class JSON. Index any field, attach metadata, and stop grepping unstructured text forever. |
| `Search` | Powerful query language | MQL — a typed, expressive query language. Filter, aggregate, and pivot millions of events in milliseconds. |
| `GitBranch` | Trace correlation | Stitch logs to traces and spans automatically. Follow a request from edge to database without context-switching. |
| `BellRing` | Smart alerting | Anomaly detection on any metric, routed to Slack, PagerDuty, or webhooks. Quiet, actionable, and tunable. |
| `Code2` | SDKs for every stack | Drop-in libraries for Node, Python, Go, Rust, and Ruby. Or just POST JSON — your call. |

### 4.6 CodeSection (`components/landing/CodeSection.tsx`)

Two columns on `lg`. Left: eyebrow `SDKs`, headline `One line. Any stack.`, subhead, then a `Read the full API docs →` link to `#api`. Right: terminal card with shadcn `Tabs` (Node, Python, Go, cURL) + copy button.

```ts
const SNIPPETS: Record<string, string> = {
  Node: `import { MiLog } from "@milog/sdk";

const log = new MiLog({ apiKey: process.env.MILOG_KEY });

log.info("checkout.completed", {
  userId: "usr_193",
  amount: 2900,
  currency: "USD",
  traceId: req.traceId,
});`,
  Python: `from milog import MiLog

log = MiLog(api_key=os.environ["MILOG_KEY"])

log.info("checkout.completed", {
    "user_id": "usr_193",
    "amount": 2900,
    "currency": "USD",
    "trace_id": trace_id,
})`,
  Go: `package main

import "github.com/milog/sdk-go"

func main() {
    log := milog.New(os.Getenv("MILOG_KEY"))
    log.Info("checkout.completed", milog.Fields{
        "user_id":  "usr_193",
        "amount":   2900,
        "currency": "USD",
    })
}`,
  cURL: `curl https://api.milog.dev/v1/events \\
  -H "Authorization: Bearer $MILOG_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "level": "info",
    "event": "checkout.completed",
    "data": { "userId": "usr_193", "amount": 2900 }
  }'`,
};
```

Tabs styled: `bg-transparent`, each trigger `h-7 px-2.5 font-mono text-xs data-[state=active]:bg-accent`. Copy button uses `lucide-react` `Copy` / `Check` with a 1400ms swap.

### 4.7 InteractiveDemo

Already covered in §3. Section eyebrow `Live demo`, headline `Replay any incident, frame by frame.`, subhead `Filter, scrub, and dive into any event. The same UI you'll use every day — try it right here, with sample production traffic.`

### 4.8 Pricing

3 cards, `lg:grid-cols-3`, stretch. Growth is highlighted: `border-transparent ring-gradient-brand shadow-glow lg:-mt-4`, with a small `Best value` pill on top. CTA on highlighted card uses `bg-gradient-brand`; others use `bg-secondary`.

**Eyebrow:** `Pricing` · **Headline:** `Simple, predictable pricing.` · **Subhead:** `Start on a generous free trial. Scale linearly. No surprise overage bills.`

| | **Starter** | **Growth** *(Best value)* | **Pro** |
|---|---|---|---|
| Price | $9 / month | $29 / month | $79 / month |
| Tagline | For side projects and prototypes. | For growing teams shipping fast. | For production-critical workloads. |
| Events / month | 1M | 10M | 50M |
| Retention | 7 days | 30 days | 90 days |
| Team seats | 3 | 10 | Unlimited |
| Alerting | Basic | Advanced | Advanced + on-call |
| Trace correlation | — | ✓ | ✓ |
| SSO / SAML | — | — | ✓ |
| Support | Community | Email | Priority + Slack |
| CTA | Start free | Start 14-day trial | Contact sales |

Booleans render as `Check` (`text-level-info`) or `Minus` (`text-muted-foreground/60`).

### 4.9 FinalCTA

Centered card with `bg-radial-glow` + `bg-grid` overlays, generous padding (`p-10 sm:p-16`).

- **Headline:** `Ship with confidence.` (last word gradient)
- **Subhead:** `Spin up MiLog in under a minute. Free for the first million events, every month. No credit card required.`
- **CTAs:** `Start free` (gradient) · `Read the docs` (outline)

### 4.10 Footer

`md:grid-cols-[1.4fr_repeat(4,1fr)]`. First column = Logo + `The timeline your logs deserve. Built for developers who actually read their logs.`

| Product | Developers | Company | Legal |
|---|---|---|---|
| Features | API Reference | About | Privacy |
| Pricing | Documentation | Customers | Terms |
| Changelog | Status | Blog | Security |
| Roadmap | SDKs | Careers | DPA |

Bottom bar: `© 2026 MiLog, Inc. All rights reserved.` left · `all systems operational · v2.0.4` (mono) right.

---

## 5. Page assembly (`app/page.tsx`)

```tsx
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { Features } from "@/components/landing/Features";
import { CodeSection } from "@/components/landing/CodeSection";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <h1 className="sr-only">MiLog — the timeline your logs deserve</h1>
      <Nav />
      <Hero />
      <TrustedBy />
      <Features />
      <CodeSection />
      <InteractiveDemo />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
```

---

## 6. Migration checklist (Vite → Next.js)

- [ ] Move `src/index.css` → `app/globals.css` and import in `app/layout.tsx`.
- [ ] Copy `tailwind.config.ts` (update `content` paths to `./app` + `./components`).
- [ ] Replace Google Fonts `<link>` with `next/font` (§1).
- [ ] Force `<html lang="en" className="dark">`.
- [ ] Run shadcn CLI for `button`, `tabs`, `dropdown-menu`, `toggle-group`.
- [ ] Add `'use client'` to: `TimelinePreview`, `InteractiveDemo`, `CodeSection`, any other stateful component.
- [ ] Move `src/lib/utils.ts` (the `cn` helper) to `lib/utils.ts`.
- [ ] Replace in-page anchors with `next/link` if your nav crosses routes.
- [ ] Set page `metadata` (title/description) in `app/layout.tsx`.
- [ ] Respect `prefers-reduced-motion` (already covered by the keyframe override).
