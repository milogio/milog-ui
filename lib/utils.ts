import { formatDistanceToNowStrict, formatISO, format as formatDate } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import type { LogLevel } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function normalizeLogLevel(level: string): LogLevel {
  switch (level) {
    case "warn":
    case "warning":
      return "warning";
    case "fatal":
    case "error":
      return "error";
    case "success":
      return "success";
    case "debug":
    case "trace":
      return "debug";
    default:
      return "info";
  }
}

export function formatRelativeTime(value: string) {
  return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
}

export function formatExactTimestamp(value: string) {
  return formatDate(new Date(value), "PPP p");
}

export function formatDownloadDate(value = new Date()) {
  return formatDate(value, "yyyy-MM-dd");
}

export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function compactDateTime(value: string) {
  return formatDate(new Date(value), "MMM d, yyyy HH:mm:ss");
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function isNonEmpty(value?: string) {
  return Boolean(value && value.trim().length > 0);
}

export function toIsoDate(value?: string) {
  return value ? formatISO(new Date(value)) : undefined;
}
