"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import type { TimelineEvent } from "@/lib/types";
import { formatExactTimestamp, formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { ActorBadge } from "@/components/ActorBadge";
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
    <article
      className={`panel rounded-3xl p-5 ${selected ? "border-primary/60 shadow-[0_20px_50px_rgba(79,70,229,0.18)]" : "hover:border-white/18"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <button className="flex flex-1 cursor-pointer flex-col text-left" onClick={onSelect}>
          <div className="flex flex-wrap items-center gap-3">
            <LogLevelBadge level={event.log_level} />
            <time
              title={formatExactTimestamp(event.occurrence_date)}
              className="font-mono text-xs tracking-wide text-muted"
            >
              {formatRelativeTime(event.occurrence_date)}
            </time>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">{event.message}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
            <ActorBadge actor={event.actor} />
            <span>{formatExactTimestamp(event.occurrence_date)}</span>
          </div>
          <MetadataChips event={event} visibleKeys={visibleMetadataKeys} />
        </button>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-secondary px-3 py-2 text-xs"
            onClick={async () => {
              await navigator.clipboard.writeText(JSON.stringify(event.metadata, null, 2));
              pushToast({ title: "Metadata copied to clipboard.", tone: "success" });
            }}
          >
            <Copy className="size-3.5" />
            Copy
          </button>
          {!readOnly ? (
            <button className="btn btn-secondary px-3 py-2 text-xs" onClick={() => setExpanded((value) => !value)}>
              {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              JSON
            </button>
          ) : null}
        </div>
      </div>
      {expanded ? (
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/30 p-4 font-mono text-xs text-slate-300">
          {JSON.stringify(event.metadata, null, 2)}
        </pre>
      ) : null}
    </article>
  );
}
