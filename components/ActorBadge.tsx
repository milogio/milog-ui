export function ActorBadge({ actor }: { actor: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] text-foreground/85">
      {actor}
    </span>
  );
}
