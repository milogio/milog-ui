export type LogLevel = "info" | "warn" | "error" | "trace" | "debug";

export interface LogEvent {
  id: string;
  ts: string;
  level: LogLevel;
  service: string;
  message: string;
  latencyMs?: number;
  traceId: string;
  payload: Record<string, unknown>;
}

export const SERVICES = ["api-gateway", "auth-svc", "billing", "checkout", "worker"] as const;

function ts(seconds: number) {
  const base = new Date(Date.UTC(2026, 4, 1, 14, 22, 0));
  base.setMilliseconds(base.getMilliseconds() + seconds * 1000);
  const h = String(base.getUTCHours()).padStart(2, "0");
  const m = String(base.getUTCMinutes()).padStart(2, "0");
  const s = String(base.getUTCSeconds()).padStart(2, "0");
  const ms = String(base.getUTCMilliseconds()).padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}

export const LOG_EVENTS: LogEvent[] = [
  {
    id: "e1",
    ts: ts(0),
    level: "info",
    service: "api-gateway",
    message: "GET /v1/invoices 200",
    latencyMs: 42,
    traceId: "tr_8f1c2a",
    payload: { method: "GET", path: "/v1/invoices", status: 200, userId: "usr_193" },
  },
  {
    id: "e2",
    ts: ts(0.4),
    level: "trace",
    service: "auth-svc",
    message: "Token verified for usr_193",
    traceId: "tr_8f1c2a",
    payload: { userId: "usr_193", scope: ["read:invoices"] },
  },
  {
    id: "e3",
    ts: ts(0.9),
    level: "info",
    service: "billing",
    message: "Invoice in_42a generated",
    latencyMs: 118,
    traceId: "tr_8f1c2a",
    payload: { invoiceId: "in_42a", amount: 2900, currency: "USD" },
  },
  {
    id: "e4",
    ts: ts(1.6),
    level: "warn",
    service: "checkout",
    message: "Retrying payment intent (attempt 2)",
    traceId: "tr_55d910",
    payload: { intentId: "pi_771", attempt: 2, reason: "network_timeout" },
  },
  {
    id: "e5",
    ts: ts(2.1),
    level: "error",
    service: "checkout",
    message: "Payment intent failed: card_declined",
    traceId: "tr_55d910",
    payload: { intentId: "pi_771", code: "card_declined", declineCode: "insufficient_funds" },
  },
  {
    id: "e6",
    ts: ts(2.7),
    level: "info",
    service: "worker",
    message: "Webhook delivered to acme.com",
    latencyMs: 213,
    traceId: "tr_a01f3c",
    payload: { event: "invoice.paid", url: "https://acme.com/hooks", status: 200 },
  },
  {
    id: "e7",
    ts: ts(3.3),
    level: "debug",
    service: "api-gateway",
    message: "Cache hit for /v1/customers/cus_88",
    traceId: "tr_b22e4d",
    payload: { key: "/v1/customers/cus_88", ttlMs: 30000 },
  },
  {
    id: "e8",
    ts: ts(4.0),
    level: "info",
    service: "auth-svc",
    message: "Issued session for usr_204",
    latencyMs: 31,
    traceId: "tr_c91842",
    payload: { userId: "usr_204", expiresIn: 3600 },
  },
  {
    id: "e9",
    ts: ts(4.6),
    level: "warn",
    service: "billing",
    message: "Tax rate fallback applied (region: EU-FR)",
    traceId: "tr_c91842",
    payload: { region: "EU-FR", rate: 0.2 },
  },
  {
    id: "e10",
    ts: ts(5.2),
    level: "info",
    service: "api-gateway",
    message: "POST /v1/charges 201",
    latencyMs: 96,
    traceId: "tr_c91842",
    payload: { method: "POST", path: "/v1/charges", status: 201 },
  },
  {
    id: "e11",
    ts: ts(5.9),
    level: "error",
    service: "worker",
    message: "Job failed: send_receipt_email",
    traceId: "tr_d44a91",
    payload: { jobId: "job_998", error: "SMTPConnectError" },
  },
  {
    id: "e12",
    ts: ts(6.4),
    level: "trace",
    service: "billing",
    message: "Recomputed MRR for tenant ten_77",
    traceId: "tr_e51b22",
    payload: { tenantId: "ten_77", mrr: 18420 },
  },
];
