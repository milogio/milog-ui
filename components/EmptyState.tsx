import { Sparkles } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div role="status" className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-border bg-card px-8 py-12 text-center shadow-soft">
      <div className="mb-5 rounded-md border border-border bg-background p-3">
        <Sparkles className="size-5 text-brand" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
