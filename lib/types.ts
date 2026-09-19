export type LogLevel = "debug" | "info" | "success" | "warning" | "error";

export type MiLogUser = {
  id: string;
  name: string;
  email: string;
  tenant_id: string;
};

export type MiLogTenant = {
  id: string;
  name: string;
};

export type TimelineEvent = {
  id: string;
  tenant_id: string;
  occurrence_date: string;
  log_level: LogLevel;
  actor: string;
  message: string;
  metadata: Record<string, unknown>;
};

export type TimelineFilters = {
  start_date?: string;
  end_date?: string;
  log_level?: LogLevel[];
  actor?: string;
  message?: string;
  metadata_key?: string;
  metadata_value?: string;
  limit?: number;
};

export type AlertRule = {
  id: string;
  name: string;
  enabled: boolean;
  filters: TimelineFilters;
  created_at: string;
  last_triggered_at?: string;
};

export type AuthSession = {
  token: string;
  user: MiLogUser;
  tenant: MiLogTenant;
};

export type ApiLoginResponse = {
  token?: string;
  access_token?: string;
  user?: Partial<MiLogUser>;
  tenant?: MiLogTenant;
};

export type ApiTimelineEvent = {
  id: string;
  tenant_id: string;
  occurrence_date?: string;
  occurred_at?: string;
  log_level: string;
  actor?: string;
  actor_id?: string;
  actor_type?: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export type ApiTimelineResponse = {
  data: ApiTimelineEvent[];
  meta?: {
    next_cursor?: string | null;
    prev_cursor?: string | null;
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
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
