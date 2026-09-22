import { ArrowRight } from "lucide-react";
import type { TimelineEvent } from "@/lib/types";

function EntityIdentity({ role, type, id }: { role: "Actor" | "Target"; type?: string | null; id?: string | null }) {
  return (
    <span className="min-w-0" aria-label={`${role}: ${type ?? "unknown type"} ${id ?? "unknown identifier"}`}>
      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">{role}</span>
      <span className="block truncate text-foreground">
        <span className="text-muted-foreground">{type ?? "unknown"}</span>
        <span aria-hidden="true"> · </span>
        <span>{id ?? "unknown"}</span>
      </span>
    </span>
  );
}

export function EventContext({ event, compact = false }: { event: TimelineEvent; compact?: boolean }) {
  return (
    <div className={`grid min-w-0 items-center ${compact ? "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-2" : "grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"}`}>
      <EntityIdentity role="Actor" type={event.actor_type} id={event.actor_id} />
      <span className="flex items-center gap-2 text-brand" aria-label={`Action: ${event.action ?? "unknown"}`}>
        <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate font-medium">{event.action ?? "unknown action"}</span>
        <ArrowRight className="hidden size-3.5 shrink-0 sm:block" aria-hidden="true" />
      </span>
      <EntityIdentity role="Target" type={event.target_type} id={event.target_id} />
    </div>
  );
}
