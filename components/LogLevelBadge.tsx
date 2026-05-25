import { AlertTriangle, Bug, CheckCircle2, Info, OctagonAlert } from "lucide-react";
import type { LogLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const config: Record<LogLevel, { icon: React.ComponentType<{ className?: string }>; className: string }> = {
  debug: { icon: Bug, className: "bg-slate-500/12 text-slate-300 border-slate-400/20" },
  info: { icon: Info, className: "bg-blue-500/12 text-blue-300 border-blue-400/20" },
  success: { icon: CheckCircle2, className: "bg-emerald-500/12 text-emerald-300 border-emerald-400/20" },
  warning: { icon: AlertTriangle, className: "bg-amber-500/12 text-amber-300 border-amber-400/20" },
  error: { icon: OctagonAlert, className: "bg-red-500/12 text-red-300 border-red-400/20" },
};

export function LogLevelBadge({ level }: { level: LogLevel }) {
  const Icon = config[level].icon;
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium", config[level].className)}>
      <Icon className="size-3.5" />
      {level}
    </span>
  );
}
