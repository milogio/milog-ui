const origin = (process.env.MILOG_SMOKE_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");
const email = process.env.MILOG_SMOKE_EMAIL;
const password = process.env.MILOG_SMOKE_PASSWORD;
const tenantId = process.env.MILOG_SMOKE_TENANT_ID;

if (!email || !password) {
  throw new Error("Set MILOG_SMOKE_EMAIL and MILOG_SMOKE_PASSWORD before running the smoke test.");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function json(response) {
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message ?? `${response.status} ${response.statusText}`);
  return body;
}

const loginResponse = await fetch(`${origin}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify({ email, password, ...(tenantId ? { tenant_id: tenantId } : {}) }),
  redirect: "manual",
});
const login = await json(loginResponse);
const setCookie = loginResponse.headers.get("set-cookie");
assert(setCookie, "Login did not issue a session cookie.");
const cookie = setCookie.split(";", 1)[0];
assert(login.user?.tenant_id === login.tenant?.id, "Login identity was not bound to the returned tenant.");

try {
  const session = await json(await fetch(`${origin}/api/auth/session`, { headers: { Cookie: cookie, Accept: "application/json" } }));
  assert(session.tenant?.id === login.tenant.id, "Restored session changed tenant.");

  const firstPage = await json(await fetch(`${origin}/api/timeline`, { headers: { Cookie: cookie, Accept: "application/json" } }));
  assert(Array.isArray(firstPage.events), "First timeline response did not contain events.");
  assert(firstPage.nextCursor, "Smoke-test tenant needs more than one cursor page.");

  const secondPage = await json(await fetch(`${origin}/api/timeline?cursor=${encodeURIComponent(firstPage.nextCursor)}`, {
    headers: { Cookie: cookie, Accept: "application/json" },
  }));
  assert(Array.isArray(secondPage.events), "Second timeline response did not contain events.");

  const firstIds = new Set(firstPage.events.map((event) => event.id));
  assert(secondPage.events.every((event) => !firstIds.has(event.id)), "Cursor pages contained duplicate events.");
  assert([...firstPage.events, ...secondPage.events].every((event) => event.tenant_id === login.tenant.id), "Timeline returned an event from another tenant.");

  console.log(`Smoke test passed for tenant ${login.tenant.id}: ${firstPage.events.length} first-page events, ${secondPage.events.length} second-page events.`);
} finally {
  await fetch(`${origin}/api/auth/logout`, { method: "POST", headers: { Cookie: cookie, Accept: "application/json" } }).catch(() => undefined);
}
