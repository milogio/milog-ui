"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

const SNIPPET = `curl "$MILOG_API_URL/api/v1/events" \\
  -H "X-API-Key: $MILOG_API_KEY" \\
  -H "X-Idempotency-Key: checkout-1001" \\
  -H "Content-Type: application/json" \\
  -d '{
    "actor_type": "user",
    "actor_id": "user-42",
    "action": "completed",
    "target_type": "checkout",
    "target_id": "checkout-1001",
    "log_level": "info",
    "metadata": { "amount": 2900, "currency": "USD" }
  }'`;

export function CodeSection() {
  const [copied, setCopied] = useState(false);

  return (
    <section id="api-example" className="border-b border-border">
      <div className="container marketing-section grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="marketing-copy">
          <p className="marketing-section-label text-gradient-brand">Public API</p>
          <h2 className="marketing-heading mt-3 font-semibold">
            Send a structured event over HTTP.
          </h2>
          <p className="marketing-prose mt-4">
            The documented ingestion endpoint accepts tenant-scoped events with actor, action, target,
            level, timestamp, and metadata fields. Idempotency keys make safe retries possible.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <span className="font-mono text-xs text-muted-foreground">cURL · documented request shape</span>
            <button
              className="marketing-control inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-xs text-muted-foreground hover:text-foreground"
              onClick={async () => {
                await navigator.clipboard.writeText(SNIPPET);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1400);
              }}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-6 text-foreground/90">
            {SNIPPET}
          </pre>
        </div>
      </div>
    </section>
  );
}
