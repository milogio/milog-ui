import { RotateCcw, TriangleAlert } from "lucide-react";

export function ErrorState({
  title = "Something went sideways",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-lg border border-destructive/30 bg-card px-5 py-6 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-2.5">
          <TriangleAlert className="size-5 text-error" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          {onRetry ? (
            <button type="button" className="btn btn-secondary mt-5" onClick={onRetry}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
