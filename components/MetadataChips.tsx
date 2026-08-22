import type { TimelineEvent } from "@/lib/types";

export function MetadataChips({
  event,
  visibleKeys,
}: {
  event: TimelineEvent;
  visibleKeys: string[];
}) {
  const entries = visibleKeys
    .map((key) => [key, event.metadata[key]] as const)
    .filter((entry) => entry[1] !== undefined);

  if (!entries.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground"
        >
          <span className="text-foreground/85">{key}</span>
          <span className="mx-1">=</span>
          <span>{String(value)}</span>
        </div>
      ))}
    </div>
  );
}
