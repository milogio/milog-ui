import { Copy } from "lucide-react";
import type { TimelineEvent } from "@/lib/types";
import { writeClipboardText } from "@/lib/clipboard";
import { formatExactTimestamp } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { LogLevelBadge } from "@/components/LogLevelBadge";
import { EventContext } from "@/components/EventContext";

export function TimelineDetailsPanel({ event }: { event: TimelineEvent }) {
  const { pushToast } = useToast();

  async function copyWithFeedback(value: string, label: "Actor ID" | "Target ID" | "Metadata") {
    const copied = await writeClipboardText(value);
    const sentenceLabel = `${label[0].toLowerCase()}${label.slice(1)}`;
    pushToast(copied
      ? { title: `${label} copied to clipboard.`, tone: "success" }
      : { title: `Unable to copy ${sentenceLabel}. Check clipboard permissions and try again.`, tone: "error" });
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gradient-brand">Event details</p>
          <h3 className="mt-3 text-base font-semibold text-foreground">Event context</h3>
        </div>
        <LogLevelBadge level={event.log_level} />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-background p-4">
        <EventContext event={event} />
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {event.actor_id ? (
            <button
              className="btn btn-secondary px-3 py-2 text-xs"
              onClick={() => void copyWithFeedback(event.actor_id!, "Actor ID")}
            >
              <Copy className="size-3.5" aria-hidden="true" />
              Copy actor ID
            </button>
          ) : null}
          {event.target_id ? (
            <button
              className="btn btn-secondary px-3 py-2 text-xs"
              onClick={() => void copyWithFeedback(event.target_id!, "Target ID")}
            >
              <Copy className="size-3.5" aria-hidden="true" />
              Copy target ID
            </button>
          ) : null}
        </div>
        <p className="mt-4 border-t border-border pt-4 text-sm leading-6 text-foreground">
          {event.message.trim() || "No message provided."}
        </p>
      </div>

      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Occurred</dt>
          <dd className="mt-1 font-mono text-foreground">
            <time dateTime={event.occurred_at ?? undefined}>{formatExactTimestamp(event.occurred_at)}</time>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd className="mt-1 font-mono text-foreground">
            <time dateTime={event.created_at ?? undefined}>{formatExactTimestamp(event.created_at)}</time>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Log level</dt>
          <dd className="mt-1 font-mono text-foreground">
            {event.raw_log_level ?? "Unknown"}
            {event.raw_log_level && event.raw_log_level !== event.log_level ? ` (displayed as ${event.log_level})` : ""}
          </dd>
        </div>
        <div><dt className="text-muted-foreground">Event ID</dt><dd className="mt-1 break-all font-mono text-foreground">{event.id}</dd></div>
        <div>
          <dt className="text-muted-foreground">Tenant</dt>
          <dd className="mt-1 font-mono text-foreground">{event.tenant_id}</dd>
        </div>
      </dl>

      <div className="mt-6 flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Metadata JSON</h4>
        <button
          className="btn btn-secondary px-3 py-2 text-xs"
          onClick={() => void copyWithFeedback(JSON.stringify(event.metadata, null, 2), "Metadata")}
        >
          <Copy className="size-3.5" aria-hidden="true" />
          Copy metadata
        </button>
      </div>

      <pre className="mt-3 max-h-[50vh] overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground/90 scrollbar-thin">
        {JSON.stringify(event.metadata, null, 2)}
      </pre>
    </div>
  );
}
