"use client";

import { useState } from "react";
import { resendVerification } from "@/lib/accountApi";
import { accountErrorMessage, fieldError } from "@/lib/accountUi";

export function ResendVerification({ initialEmail = "" }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <form className="mt-6 space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      setError("");
      setEmailError(undefined);
      setBusy(true);
      try {
        await resendVerification(email);
        setSent(true);
      } catch (failure) {
        setEmailError(fieldError(failure, "email"));
        setError(accountErrorMessage(failure));
      } finally {
        setBusy(false);
      }
    }}>
      <label className="block space-y-2 text-sm">
        <span className="text-muted-foreground">Email</span>
        <input className="input" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        {emailError ? <span className="text-destructive-foreground">{emailError}</span> : null}
      </label>
      {sent ? <p role="status" className="text-sm text-foreground">If this address has a pending signup, check your email for a new link.</p> : null}
      {error ? <p role="alert" className="text-sm text-destructive-foreground">{error}</p> : null}
      <button className="btn btn-secondary" disabled={busy}>{busy ? "Sending…" : "Resend verification email"}</button>
    </form>
  );
}
