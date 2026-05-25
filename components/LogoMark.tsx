import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-secondary shadow-[0_20px_40px_rgba(99,102,241,0.35)]",
        className,
      )}
    >
      <span className="font-mono text-sm font-bold tracking-[0.24em] text-white">ML</span>
    </div>
  );
}
