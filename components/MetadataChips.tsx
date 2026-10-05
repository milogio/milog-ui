import type { TimelineEvent } from "@/lib/types";

export function MetadataChips({
  event,
  visibleKeys,
  compact = false,
}: {
  event: TimelineEvent;
  visibleKeys: string[];
  compact?: boolean;
}) {
  const entries = visibleKeys
    .map((key) => [key, event.metadata[key]] as const)
    .filter((entry) => entry[1] !== undefined);

  if (!entries.length) return null;

  return (
    <div className={`${compact ? "mt-1.5" : "mt-3"} flex min-w-0 flex-wrap gap-1.5`}>
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="flex max-w-full min-w-0 rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground"
        >
          <span className="shrink-0 text-foreground/85">{key}</span>
          <span className="mx-1 shrink-0">=</span>
          <span className="min-w-0 break-all">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}
