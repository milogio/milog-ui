"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import type { TimelineEvent } from "@/lib/types";
import { formatExactTimestamp, formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { EventContext } from "@/components/EventContext";
import { LogLevelBadge } from "@/components/LogLevelBadge";
import { MetadataChips } from "@/components/MetadataChips";

export function TimelineItem({
  event,
  selected,
  onSelect,
  visibleMetadataKeys,
  readOnly = false,
}: {
  event: TimelineEvent;
  selected: boolean;
  onSelect: () => void;
  visibleMetadataKeys: string[];
  readOnly?: boolean;
}) {
  const { pushToast } = useToast();
  const [expanded, setExpanded] = useState(false);

  return (
    <li className={`animate-row-in ${selected ? "bg-accent/30" : "hover:bg-accent/40"}`}>
      <div className="grid grid-cols-[78px_70px_minmax(0,1fr)_auto] items-center gap-2 px-4 py-2 sm:grid-cols-[120px_78px_minmax(0,1fr)_auto] sm:gap-3">
        <button className="contents text-left" onClick={onSelect}>
          <time
            title={formatExactTimestamp(event.occurred_at)}
            className="truncate tabular-nums text-muted-foreground"
          >
            {formatRelativeTime(event.occurred_at)}
          </time>
          <LogLevelBadge level={event.log_level} />
          <span className="min-w-0">
            <EventContext event={event} compact />
            <span className="mt-1 block truncate text-[11px] text-muted-foreground">{event.message}</span>
          </span>
        </button>
        <div className="flex items-center justify-end gap-1.5">
          <button
            className="btn btn-secondary px-2 py-1.5 text-xs"
            onClick={async () => {
              await navigator.clipboard.writeText(JSON.stringify(event.metadata, null, 2));
              pushToast({ title: "Metadata copied to clipboard.", tone: "success" });
            }}
          >
            <Copy className="size-3.5" />
            Copy
          </button>
          {!readOnly ? (
            <button className="btn btn-secondary px-2 py-1.5 text-xs" onClick={() => setExpanded((value) => !value)}>
              {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              JSON
            </button>
          ) : null}
        </div>
      </div>
      <div className="px-4 pb-2 pl-4 sm:pl-[222px]">
        <MetadataChips event={event} visibleKeys={visibleMetadataKeys} />
      </div>
      {expanded ? (
        <div className="border-t border-border/60 bg-background/40 px-4 py-3">
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
