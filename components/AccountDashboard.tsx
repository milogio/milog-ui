"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ApiEntitlement, ApiKeyMetadata } from "@/lib/apiContract";
import { AccountApiError, createApiKey, getEntitlement, listApiKeys, revokeApiKey } from "@/lib/accountApi";
import { accountErrorMessage } from "@/lib/accountUi";
import { useAuth } from "@/providers/auth-provider";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function dateText(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function keyFailureMessage(error: unknown) {
  if (error instanceof AccountApiError) {
    if (error.code === "invalid_credentials") return "Current password was incorrect. Try again.";
    if (error.code === "entitlement_required") return "Your account cannot issue this key right now. Review its entitlement below.";
    if (error.code === "key_limit_reached") return "The key limit has been reached. Revoking a temporary key does not restore its lifetime issuance allowance.";
    if (error.code === "forbidden") return "Only an owner or admin can manage API keys.";
  }
  return accountErrorMessage(error);
}

export function AccountDashboard() {
  const { user, tenant, entitlement: sessionEntitlement, loading } = useAuth();
  const canManage = tenant?.role === "owner" || tenant?.role === "admin";
  const [entitlement, setEntitlement] = useState<ApiEntitlement | null>(null);
  const displayedEntitlement = entitlement ?? sessionEntitlement;
  const [keys, setKeys] = useState<ApiKeyMetadata[]>([]);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [actionError, setActionError] = useState("");
  const [rawKey, setRawKey] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const refresh = useCallback(async () => {
    if (!user || !tenant) return;
    try {
      const [nextEntitlement, nextKeys] = await Promise.all([
        getEntitlement(),
        canManage ? listApiKeys() : Promise.resolve([]),
      ]);
      setEntitlement(nextEntitlement);
      setKeys(nextKeys);
      setLoadError("");
    } catch (error) {
      setLoadError(accountErrorMessage(error));
    }
  }, [canManage, tenant, user]);

  useEffect(() => {
    queueMicrotask(() => { void refresh(); });
  }, [refresh]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    setRawKey("");
    setBusy(true);
    try {
      const result = await createApiKey(name.trim(), password);
      setPassword("");
      setRawKey(result.api_key);
      setName("");
      await refresh();
    } catch (error) {
      setActionError(keyFailureMessage(error));
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  async function handleRevoke(key: ApiKeyMetadata) {
    if (!window.confirm(`Revoke ${key.name}? It will stop working on the next API request.`)) return;
    setActionError("");
    setBusy(true);
    try {
      await revokeApiKey(key.id);
      await refresh();
    } catch (error) {
      setActionError(keyFailureMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(rawKey);
      setCopyMessage("Key copied. Store it securely now.");
    } catch {
      setCopyMessage("Copy failed. Select the key and copy it manually.");
    }
  }

  function downloadKey() {
    const url = URL.createObjectURL(new Blob([`${rawKey}\n`], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "milog-api-key.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{tenant?.name ?? "Account"}</p><h1 className="mt-2 text-2xl font-semibold">Account and API credentials</h1></div>
          <Link href="/timeline" className="btn btn-secondary">Back to timeline</Link>
        </div>
        {loading ? <p role="status" className="mt-8">Loading account…</p> : null}
        {loadError ? <div role="alert" className="mt-8 rounded-lg border border-destructive/30 p-4"><p>{loadError}</p><button className="btn btn-secondary mt-3" onClick={() => void refresh()}>Retry</button></div> : null}
        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-soft" aria-labelledby="entitlement-heading">
          <h2 id="entitlement-heading" className="text-lg font-semibold">Account status</h2>
          {displayedEntitlement ? (
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-muted-foreground">State</dt><dd className="mt-1 capitalize">{displayedEntitlement.state.replaceAll("_", " ")}</dd></div>
              <div><dt className="text-muted-foreground">Evaluation ends</dt><dd className="mt-1">{dateText(displayedEntitlement.trial_ends_at)}</dd></div>
              <div><dt className="text-muted-foreground">Billing status</dt><dd className="mt-1 capitalize">{displayedEntitlement.billing_status}</dd></div>
              <div><dt className="text-muted-foreground">Paid through</dt><dd className="mt-1">{dateText(displayedEntitlement.paid_through_at)}</dd></div>
              <div><dt className="text-muted-foreground">Grace ends</dt><dd className="mt-1">{dateText(displayedEntitlement.grace_ends_at)}</dd></div>
            </dl>
          ) : !loadError ? <p role="status" className="mt-4 text-sm text-muted-foreground">Loading entitlement…</p> : null}
        </section>

        {canManage ? (
          <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-soft" aria-labelledby="keys-heading">
            <h2 id="keys-heading" className="text-lg font-semibold">API keys</h2>
            <p className="mt-2 text-sm text-muted-foreground">Keys are shown here by prefix. A full key is available only when it is created.</p>
            {rawKey ? (
              <div className="mt-6 rounded-lg border border-level-warn/40 bg-level-warn/10 p-4">
                <h3 className="font-semibold">Save this key now</h3>
                <p className="mt-2 text-sm">This is the only time its full value is shown. Copy or download it and store it securely.</p>
                <code className="mt-3 block break-all rounded-md bg-background p-3 text-xs" data-testid="one-time-api-key">{rawKey}</code>
                <div className="mt-3 flex flex-wrap gap-2"><button className="btn btn-secondary" onClick={() => void copyKey()}>Copy key</button><button className="btn btn-secondary" onClick={downloadKey}>Download key</button><button className="btn btn-secondary" onClick={() => { setRawKey(""); setCopyMessage(""); }}>I saved it</button></div>
                {copyMessage ? <p role="status" className="mt-2 text-sm">{copyMessage}</p> : null}
              </div>
            ) : null}
            {rawKey ? null : displayedEntitlement?.can_create_temporary_key ? (
              <form className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={(event) => void handleCreate(event)}>
                <label className="space-y-2 text-sm"><span className="block text-muted-foreground">Key name</span><input className="input" maxLength={100} required value={name} onChange={(event) => setName(event.target.value)} /></label>
                <label className="space-y-2 text-sm"><span className="block text-muted-foreground">Current password</span><input className="input" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
                <button className="btn btn-primary" disabled={busy}>{busy ? "Working…" : "Create temporary key"}</button>
              </form>
            ) : <p className="mt-5 text-sm text-muted-foreground">Temporary key creation is unavailable for this account.</p>}
            {actionError ? <p role="alert" className="mt-4 text-sm text-destructive-foreground">{actionError}</p> : null}
            <div className="mt-8 space-y-3" aria-label="Existing API keys">
              {keys.length === 0 ? <p className="text-sm text-muted-foreground">No API keys to show.</p> : keys.map((key) => (
                <div key={key.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4 text-sm">
                  <div><h3 className="font-medium">{key.name}</h3><p className="mt-1 font-mono text-xs text-muted-foreground">{key.key_prefix}</p><p className="mt-2 text-muted-foreground">{key.kind} · {key.status} · Created {dateText(key.created_at)} · Expires {dateText(key.expires_at)} · Last used {dateText(key.last_used_at)}{key.revoked_at ? ` · Revoked ${dateText(key.revoked_at)}` : ""}</p></div>
                  {key.status === "active" ? <button className="btn btn-secondary" disabled={busy} onClick={() => void handleRevoke(key)}>Revoke {key.name}</button> : null}
                </div>
              ))}
            </div>
          </section>
        ) : tenant ? <p className="mt-6 text-sm text-muted-foreground">Only an owner or admin can manage API keys.</p> : null}
      </main>
    </ProtectedRoute>
  );
}
