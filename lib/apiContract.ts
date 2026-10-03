import type { operations as PublicOperations } from "@/lib/generated/public-api";
import type { components as UiComponents } from "@/lib/generated/ui-api";

export type ApiTimelineQuery = NonNullable<
  PublicOperations["listTimelineEvents"]["parameters"]["query"]
>;
export type ApiTimelineEventContract =
  PublicOperations["listTimelineEvents"]["responses"][200]["content"]["application/json"]["data"][number];
export type ApiLoginRequest = UiComponents["schemas"]["LoginRequest"];
export type ApiTokenResponse = UiComponents["schemas"]["TokenResponse"];

// Laravel cursor pagination adds these fields to the collection documented by
// the public API. Keeping the extension explicit makes drift visible while the
// base event and query contracts continue to come directly from OpenAPI.
export type ApiCursorPaginationMeta = {
  next_cursor?: string | null;
  prev_cursor?: string | null;
  per_page?: number;
  total?: number | null;
};
