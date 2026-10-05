import { Copy } from "lucide-react";
import type { TimelineEvent } from "@/lib/types";
import { formatExactTimestamp } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { LogLevelBadge } from "@/components/LogLevelBadge";
import { EventContext } from "@/components/EventContext";

export function TimelineDetailsPanel({ event }: { event: TimelineEvent }) {
  const { pushToast } = useToast();

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
              onClick={async () => {
                await navigator.clipboard.writeText(event.actor_id!);
                pushToast({ title: "Actor ID copied to clipboard.", tone: "success" });
              }}
            >
              <Copy className="size-3.5" />
              Copy actor ID
            </button>
          ) : null}
          {event.target_id ? (
            <button
              className="btn btn-secondary px-3 py-2 text-xs"
              onClick={async () => {
                await navigator.clipboard.writeText(event.target_id!);
                pushToast({ title: "Target ID copied to clipboard.", tone: "success" });
              }}
            >
              <Copy className="size-3.5" />
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
          <dd className="mt-1 font-mono text-foreground">{formatExactTimestamp(event.occurred_at)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd className="mt-1 font-mono text-foreground">{formatExactTimestamp(event.created_at)}</dd>
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
          onClick={async () => {
            await navigator.clipboard.writeText(JSON.stringify(event.metadata, null, 2));
            pushToast({ title: "Metadata copied to clipboard.", tone: "success" });
          }}
        >
          <Copy className="size-3.5" />
          Copy
        </button>
      </div>

      <pre className="mt-3 max-h-[50vh] overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs text-foreground/90 scrollbar-thin">
        {JSON.stringify(event.metadata, null, 2)}
      </pre>
    </div>
  );
}
