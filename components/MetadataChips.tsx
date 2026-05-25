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
    <div className="mt-4 flex flex-wrap gap-2">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-slate-300"
        >
          <span className="font-medium text-slate-100">{key}</span>
          <span className="mx-1 text-slate-500">=</span>
          <span className="font-mono">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}
