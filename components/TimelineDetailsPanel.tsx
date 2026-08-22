import { Copy } from "lucide-react";
import type { TimelineEvent } from "@/lib/types";
import { formatExactTimestamp } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { LogLevelBadge } from "@/components/LogLevelBadge";

export function TimelineDetailsPanel({ event }: { event: TimelineEvent }) {
  const { pushToast } = useToast();

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gradient-brand">Event details</p>
          <h3 className="mt-3 text-base font-semibold text-foreground">{event.message}</h3>
        </div>
        <LogLevelBadge level={event.log_level} />
      </div>

      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Occurred</dt>
          <dd className="mt-1 font-mono text-foreground">{formatExactTimestamp(event.occurrence_date)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Actor</dt>
          <dd className="mt-1 font-mono text-foreground">{event.actor}</dd>
        </div>
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
