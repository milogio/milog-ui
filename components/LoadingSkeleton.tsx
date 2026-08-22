import { cn } from "@/lib/utils";

export function LoadingSkeleton({ variant = "card" }: { variant?: "card" | "page" }) {
  if (variant === "page") {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="panel h-20 animate-pulse rounded-lg" />
          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)_360px]">
            <div className="panel h-[65vh] animate-pulse rounded-lg" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="panel h-44 animate-pulse rounded-lg" />
              ))}
            </div>
            <div className="panel h-[65vh] animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return <div className={cn("panel h-36 animate-pulse rounded-lg")} />;
}
