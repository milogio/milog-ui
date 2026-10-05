"use client";

import { useId, useState } from "react";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import type { TimelineDensity, TimelineEvent } from "@/lib/types";
import { formatExactTimestamp, formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { EventContext } from "@/components/EventContext";
import { LogLevelBadge } from "@/components/LogLevelBadge";
import { MetadataChips } from "@/components/MetadataChips";

function normalizedText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function isRedundantTimelineMessage(event: TimelineEvent) {
  const context = [event.actor_type, event.actor_id, event.action, event.target_type, event.target_id];
  if (context.some((value) => !value)) return false;
  return normalizedText(event.message) === normalizedText(context.join(" "));
}

export function TimelineItem({
  event,
  selected,
  onSelect,
  visibleMetadataKeys,
  readOnly = false,
  density = "comfortable",
}: {
  event: TimelineEvent;
  selected: boolean;
  onSelect: () => void;
  visibleMetadataKeys: string[];
  readOnly?: boolean;
  density?: TimelineDensity;
}) {
  const { pushToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const jsonPanelId = useId();
  const compact = density === "compact";
  const message = event.message.trim();
  const showMessage = !isRedundantTimelineMessage(event);
  const contextLabel = [
    event.actor_type ?? "unknown actor type",
    event.actor_id ?? "unknown actor identifier",
    event.action ?? "unknown action",
    event.target_type ?? "unknown target type",
    event.target_id ?? "unknown target identifier",
  ].join(" ");

  return (
    <li className={`animate-row-in ${selected ? "bg-accent/30" : "hover:bg-accent/40"}`}>
      <div className={`grid min-w-0 gap-x-3 ${compact ? "px-3 py-2" : "px-4 py-3"} sm:grid-cols-[minmax(0,1fr)_auto] sm:px-4`}>
        <button
          type="button"
          className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 rounded-md text-left sm:grid-cols-[120px_78px_minmax(0,1fr)] sm:items-center"
          onClick={onSelect}
          aria-label={`Open event details: ${contextLabel}${showMessage && message ? `. ${message}` : ""}`}
          aria-pressed={selected}
        >
          <time
            title={formatExactTimestamp(event.occurred_at)}
            className="truncate tabular-nums text-muted-foreground"
          >
            {formatRelativeTime(event.occurred_at)}
          </time>
          <LogLevelBadge level={event.log_level} />
          <span className="col-span-2 min-w-0 sm:col-span-1">
            <EventContext event={event} compact />
            {showMessage ? (
              <span className={`mt-1 block text-muted-foreground ${compact ? "truncate text-[11px]" : "line-clamp-2 text-xs leading-5"}`}>
                {message || "No message provided"}
              </span>
            ) : null}
          </span>
        </button>
        <div className="mt-2 flex items-center justify-end gap-1.5 sm:mt-0 sm:self-start">
          <button
            type="button"
            className="btn btn-secondary min-h-9 px-2 py-1.5 text-xs"
            onClick={async () => {
              await navigator.clipboard.writeText(JSON.stringify(event.metadata, null, 2));
              pushToast({ title: "Metadata copied to clipboard.", tone: "success" });
            }}
          >
            <Copy className="size-3.5" />
            Copy
          </button>
          {!readOnly ? (
            <button
              type="button"
              className="btn btn-secondary min-h-9 px-2 py-1.5 text-xs"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-controls={jsonPanelId}
            >
              {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              JSON
            </button>
          ) : null}
        </div>
        <div className="min-w-0 sm:col-span-full sm:pl-[210px]">
          <MetadataChips event={event} visibleKeys={visibleMetadataKeys} compact={compact} />
        </div>
      </div>
      {expanded ? (
        <div id={jsonPanelId} className="border-t border-border/60 bg-background/40 px-4 py-3">
          <div className="mb-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span>
              event_id: <span className="text-foreground">{event.id}</span>
            </span>
            <span>
              occurred_at: <span className="text-foreground">{formatExactTimestamp(event.occurred_at)}</span>
            </span>
          </div>
          <pre className="overflow-x-auto rounded-md border border-border bg-card p-3 font-mono text-[12px] text-foreground/90">
            {JSON.stringify(event.metadata, null, 2)}
          </pre>
        </div>
      ) : null}
    </li>
  );
}
