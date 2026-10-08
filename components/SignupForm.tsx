"use client";

import Link from "next/link";
import { useState } from "react";
import { signup } from "@/lib/accountApi";
import { accountErrorMessage, fieldError } from "@/lib/accountUi";
import { LogoMark } from "@/components/LogoMark";
import { ResendVerification } from "@/components/ResendVerification";

export function SignupForm({ termsUrl }: { termsUrl: string | null }) {
  const [name, setName] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card/90 p-6 shadow-soft">
      <div className="flex items-center gap-3"><LogoMark /><h1 className="text-xl font-semibold">Create a MiLog account</h1></div>
      {sent ? (
        <>
          <p role="status" className="mt-6 text-sm leading-6">Check your email for the next step. If the address can be used, we sent a verification link.</p>
          <ResendVerification initialEmail={email} />
          <Link href="/login?from=signup" className="mt-6 inline-block text-sm text-brand hover:underline">Return to sign in</Link>
        </>
      ) : termsUrl ? (
        <>
          <p className="mt-4 text-sm text-muted-foreground">Verify your email to activate your organization and begin its evaluation.</p>
          <form className="mt-6 space-y-4" onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            if (password !== confirmation) {
              setError(new Error("Passwords do not match."));
              return;
            }
            setBusy(true);
            try {
              await signup({ name, tenant_name: tenantName, email, password, password_confirmation: confirmation, terms_accepted: true });
              setPassword("");
              setConfirmation("");
              setSent(true);
            } catch (failure) {
              setError(failure);
            } finally {
              setBusy(false);
            }
          }}>
            {([
              ["Owner name", "name", name, setName, "name"],
              ["Organization name", "tenant_name", tenantName, setTenantName, "organization"],
              ["Email", "email", email, setEmail, "email"],
            ] as const).map(([label, key, value, setter, autocomplete]) => (
              <label key={key} className="block space-y-2 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <input className="input" name={key} type={key === "email" ? "email" : "text"} autoComplete={autocomplete} required value={value} onChange={(event) => setter(event.target.value)} />
                {fieldError(error, key) ? <span className="text-destructive-foreground">{fieldError(error, key)}</span> : null}
              </label>
            ))}
            <label className="block space-y-2 text-sm">
              <span className="text-muted-foreground">Password</span>
              <input className="input" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} />
              {fieldError(error, "password") ? <span className="text-destructive-foreground">{fieldError(error, "password")}</span> : null}
            </label>
            <label className="block space-y-2 text-sm">
              <span className="text-muted-foreground">Confirm password</span>
              <input className="input" type="password" autoComplete="new-password" minLength={12} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
              {fieldError(error, "password_confirmation") ? <span className="text-destructive-foreground">{fieldError(error, "password_confirmation")}</span> : null}
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" required checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1" />
              <span>I accept the <a className="text-brand underline" href={termsUrl} target="_blank" rel="noopener noreferrer">Terms of Service</a>.</span>
            </label>
            {fieldError(error, "terms_accepted") ? <p className="text-sm text-destructive-foreground">{fieldError(error, "terms_accepted")}</p> : null}
            {error ? <p role="alert" className="text-sm text-destructive-foreground">{accountErrorMessage(error)}</p> : null}
            <button className="btn btn-primary w-full justify-center" disabled={busy || !accepted}>{busy ? "Creating account…" : "Create account"}</button>
          </form>
          <Link href="/login" className="mt-6 inline-block text-sm text-brand hover:underline">Already have an account? Sign in</Link>
        </>
      ) : (
        <p role="status" className="mt-6 text-sm leading-6">Signup is not available yet. The terms for new accounts have not been published. Existing account holders can <Link href="/login" className="text-brand underline">sign in</Link>.</p>
      )}
    </div>
  );
}
