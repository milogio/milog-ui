import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-7 w-7 rounded-md bg-gradient-brand shadow-glow", className)}>
      <div className="absolute inset-[3px] flex items-center justify-center rounded-[5px] bg-background">
        <span className="font-mono text-[11px] font-bold text-gradient-brand">M</span>
      </div>
    </div>
  );
}
