"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

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

const tabs = Object.keys(SNIPPETS);

export function CodeSection() {
  const [active, setActive] = useState(tabs[0]);
  const [copied, setCopied] = useState(false);

  return (
    <section id="docs" className="border-b border-border">
      <div className="container grid gap-10 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:py-28">
        <div className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gradient-brand">SDKs</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">One line. Any stack.</h2>
          <p className="mt-4 text-muted-foreground">
            Emit structured events from the services you already run. MiLog handles ingestion, indexing,
            streaming, retention, and querying.
          </p>
          <Link href="#api" className="mt-6 inline-flex text-sm font-medium text-gradient-brand hover:underline">
            Read the full API docs -&gt;
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex rounded-md border border-border bg-background p-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActive(tab)}
                  className={cn(
                    "h-7 rounded px-2.5 font-mono text-xs text-muted-foreground",
                    active === tab && "bg-accent text-foreground",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs text-muted-foreground hover:text-foreground"
              onClick={async () => {
                await navigator.clipboard.writeText(SNIPPETS[active]);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1400);
              }}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-6 text-foreground/90">
            {SNIPPETS[active]}
          </pre>
        </div>
      </div>
    </section>
  );
}
