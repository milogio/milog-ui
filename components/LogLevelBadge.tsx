import { Check } from "lucide-react";
import type { LogLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const config: Record<LogLevel, { dot: string; label: string; surface: string; selectedSurface: string }> = {
  debug: {
    dot: "bg-level-debug",
    label: "text-level-debug",
    surface: "border-level-debug/25 bg-level-debug/10",
    selectedSurface: "border-level-debug/60 bg-level-debug/10",
  },
  info: {
    dot: "bg-level-info",
    label: "text-level-info",
    surface: "border-level-info/25 bg-level-info/10",
    selectedSurface: "border-level-info/60 bg-level-info/10",
  },
  success: {
    dot: "bg-success",
    label: "text-success",
    surface: "border-success/25 bg-success/10",
    selectedSurface: "border-success/60 bg-success/10",
  },
  warning: {
    dot: "bg-level-warn",
    label: "text-level-warn",
    surface: "border-level-warn/25 bg-level-warn/10",
    selectedSurface: "border-level-warn/60 bg-level-warn/10",
  },
  error: {
    dot: "bg-level-error",
    label: "text-level-error",
    surface: "border-level-error/25 bg-level-error/10",
    selectedSurface: "border-level-error/60 bg-level-error/10",
  },
};

export function LogLevelBadge({
  level,
  active = true,
  selected = false,
}: {
  level: LogLevel;
  active?: boolean;
  selected?: boolean;
}) {
  const styles = config[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide",
        active ? styles.label : "text-muted-foreground",
        active ? (selected ? styles.selectedSurface : styles.surface) : "border-border-strong/70 bg-background",
      )}
    >
      {selected ? (
        <Check className="size-3" aria-hidden="true" />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} aria-hidden="true" />
      )}
      {level}
    </span>
  );
}
