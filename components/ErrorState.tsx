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
    <div className="panel rounded-3xl border-red-500/20 px-6 py-8">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-red-500/10 p-3">
          <TriangleAlert className="size-5 text-error" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          {onRetry ? (
            <button className="btn btn-secondary mt-5" onClick={onRetry}>
              <RotateCcw className="size-4" />
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
