import type { LogLevel } from "@/lib/types";

export const LOG_LEVELS: readonly LogLevel[] = ["debug", "info", "success", "warning", "error"];

export function canonicalizeLogLevels(input: unknown): LogLevel[] | undefined {
  const values = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",")
      : [];
  const selected = new Set(
    values.flatMap((value) => {
      if (typeof value !== "string") return [];
      const normalized = value.trim().toLowerCase();
      return LOG_LEVELS.includes(normalized as LogLevel) ? [normalized as LogLevel] : [];
    }),
  );
  const result = LOG_LEVELS.filter((level) => selected.has(level));
  return result.length ? result : undefined;
}
