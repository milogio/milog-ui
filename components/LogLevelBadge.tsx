import type { LogLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const config: Record<LogLevel, { dot: string; label: string; surface: string }> = {
  debug: { dot: "bg-level-debug", label: "text-level-debug", surface: "border-level-debug/25 bg-level-debug/10" },
  info: { dot: "bg-level-info", label: "text-level-info", surface: "border-level-info/25 bg-level-info/10" },
  success: { dot: "bg-success", label: "text-success", surface: "border-success/25 bg-success/10" },
  warning: { dot: "bg-level-warn", label: "text-level-warn", surface: "border-level-warn/25 bg-level-warn/10" },
  error: { dot: "bg-level-error", label: "text-level-error", surface: "border-level-error/25 bg-level-error/10" },
};

export function LogLevelBadge({ level }: { level: LogLevel }) {
  const styles = config[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide",
        styles.label,
        styles.surface,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {level}
    </span>
  );
}
