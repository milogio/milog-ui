export function safeInternalPath(value: string | string[] | undefined, fallback = "/timeline") {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
  return path;
}
