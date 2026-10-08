import { AccountApiError } from "@/lib/accountApi";

export function accountErrorMessage(error: unknown): string {
  if (!(error instanceof AccountApiError)) return error instanceof Error ? error.message : "Unable to complete the request.";
  if (error.status === 429) {
    const seconds = Number(error.retryAfter);
    const retrySeconds = Number.isFinite(seconds) ? seconds : (Date.parse(error.retryAfter ?? "") - Date.now()) / 1000;
    return Number.isFinite(retrySeconds) && retrySeconds > 0
      ? `Too many requests. Try again in ${Math.ceil(retrySeconds)} seconds.`
      : "Too many requests. Please try again later.";
  }
  return error.message;
}

export function fieldError(error: unknown, name: string): string | undefined {
  return error instanceof AccountApiError ? error.errors?.[name]?.[0] : undefined;
}
