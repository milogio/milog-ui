import type {
  ApiCursorPaginationMeta,
  ApiTimelineEventContract,
  ApiTimelineQuery,
  ApiTokenResponse,
  ApiTenantRole,
} from "@/lib/apiContract";

export type LogLevel = "debug" | "info" | "success" | "warning" | "error";

export type TimelineDensity = "comfortable" | "compact";

export type MiLogUser = {
  id: string;
  name: string;
  email: string;
  tenant_id: string;
};

export type MiLogTenant = {
  id: string;
  name: string;
  role: ApiTenantRole;
};

export type TimelineEvent = {
  id: string;
  tenant_id: string;
  occurred_at: string | null;
  created_at: string | null;
  raw_log_level: string | null;
  log_level: LogLevel;
  actor: string;
  actor_id: string | null;
  actor_type: string | null;
  target_id: string | null;
  target_type: string | null;
  action: string | null;
  message: string;
  metadata: Record<string, unknown>;
};

export type TimelineQuery = Pick<ApiTimelineQuery, "target_id" | "actor_id" | "type"> & {
  log_level?: LogLevel[];
};

export type TimelineFilters = TimelineQuery;

export type AlertRule = {
  id: string;
  name: string;
  enabled: boolean;
  filters: TimelineFilters;
  created_at: string;
  last_triggered_at?: string;
  last_triggered_created_at?: string;
  last_triggered_event_id?: string;
  last_checked_at?: string;
  last_error?: string;
};

export type AuthSession = {
  token: string;
  refresh_token: string;
  user: MiLogUser;
  tenant: MiLogTenant;
  expires_at: string;
  session_expires_at: string;
};

export type ApiLoginResponse = Partial<Pick<ApiTokenResponse, "access_token" | "refresh_token" | "expires_in">> & {
  token_type?: ApiTokenResponse["token_type"] | string;
  user?: {
    id?: ApiTokenResponse["user"]["id"] | string;
    name?: string;
    email?: string;
    tenant?: MiLogTenant;
  };
};

export type ApiTimelineEvent = Partial<Omit<
  ApiTimelineEventContract,
  | "id"
  | "tenant_id"
  | "message"
  | "occurred_at"
  | "created_at"
  | "log_level"
  | "actor_id"
  | "actor_type"
  | "target_id"
  | "target_type"
  | "action"
  | "metadata"
>> & {
  id: ApiTimelineEventContract["id"];
  tenant_id: ApiTimelineEventContract["tenant_id"];
  occurrence_date?: string;
  occurred_at?: string | null;
  log_level: string | null;
  actor?: string;
  actor_id?: string | null;
  actor_type?: string | null;
  target_id?: string | null;
  target_type?: string | null;
  action?: string | null;
  created_at?: string | null;
  message: ApiTimelineEventContract["message"];
  metadata?: ApiTimelineEventContract["metadata"];
};

export type ApiTimelineResponse = {
  data: ApiTimelineEvent[];
  meta?: ApiCursorPaginationMeta & {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number | null;
  };
  links?: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
};

export type TimelinePage = {
  events: TimelineEvent[];
  nextCursor?: string;
  total?: number;
};
