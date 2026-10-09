import "server-only";

export function approvedTermsUrl(): string | null {
  const value = process.env.MILOG_TERMS_URL;
  if (!value) return null;
  if (value === "/terms") return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
