import { Copy } from "lucide-react";
import type { TimelineEvent } from "@/lib/types";
import { formatExactTimestamp } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { LogLevelBadge } from "@/components/LogLevelBadge";

export function TimelineDetailsPanel({ event }: { event: TimelineEvent | null }) {
  const { pushToast } = useToast();

  if (!event) {
    return (
      <div className="panel hidden rounded-3xl p-6 lg:block">
        <p className="text-sm text-muted">Select an event to inspect full metadata and exact context.</p>
      </div>
    );
  }

  return (
    <aside className="panel hidden h-fit rounded-3xl p-6 lg:block">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Event details</p>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{event.message}</h3>
        </div>
        <LogLevelBadge level={event.log_level} />
      </div>

      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="text-muted">Occurred</dt>
          <dd className="mt-1 font-mono text-slate-100">{formatExactTimestamp(event.occurrence_date)}</dd>
        </div>
        <div>
          <dt className="text-muted">Actor</dt>
          <dd className="mt-1 font-mono text-slate-100">{event.actor}</dd>
        </div>
        <div>
          <dt className="text-muted">Tenant</dt>
          <dd className="mt-1 font-mono text-slate-100">{event.tenant_id}</dd>
        </div>
      </dl>

      <div className="mt-6 flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-100">Metadata JSON</h4>
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

      <pre className="mt-3 max-h-[50vh] overflow-auto rounded-2xl bg-black/30 p-4 font-mono text-xs text-slate-300 scrollbar-thin">
        {JSON.stringify(event.metadata, null, 2)}
      </pre>
    </aside>
  );
}
