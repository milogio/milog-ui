import type { TimelineFilters } from "@/lib/types";
import { filtersToSearchParams, searchParamsToFilters } from "@/lib/urlState";

function toBase64Url(value: string) {
  const encoded =
    typeof window === "undefined"
      ? Buffer.from(value, "utf8").toString("base64")
      : window.btoa(unescape(encodeURIComponent(value)));

  return encoded
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  if (typeof window === "undefined") {
    return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
  }
  return decodeURIComponent(escape(window.atob(`${normalized}${padding}`)));
}

export function encodeShareState(filters: TimelineFilters) {
  const params = filtersToSearchParams(filters);
  return toBase64Url(params.toString());
}

export function decodeShareState(shareId: string): TimelineFilters | null {
  try {
    const raw = fromBase64Url(shareId);
    return searchParamsToFilters(new URLSearchParams(raw));
  } catch {
    return null;
  }
}
