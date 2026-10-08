"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { verifyEmail } from "@/lib/accountApi";
import { accountErrorMessage } from "@/lib/accountUi";
import { ResendVerification } from "@/components/ResendVerification";
import { LogoMark } from "@/components/LogoMark";

export function VerifyEmail() {
  const started = useRef(false);
  const [state, setState] = useState<"working" | "verified" | "failed">("working");
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    url.searchParams.delete("token");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    if (!token) {
      queueMicrotask(() => {
        setError("Verification link is missing or has already been used.");
        setState("failed");
      });
      return;
    }
    void verifyEmail(token).then(() => setState("verified")).catch((failure) => {
      setError(accountErrorMessage(failure));
      setState("failed");
    });
  }, []);

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 p-6 shadow-soft">
      <div className="flex items-center gap-3"><LogoMark /><h1 className="text-xl font-semibold">Verify your email</h1></div>
      {state === "working" ? <p role="status" className="mt-6 text-sm">Checking your verification link…</p> : null}
      {state === "verified" ? (
        <div className="mt-6 space-y-4 text-sm">
          <p role="status">Your email is verified. Your organization’s evaluation has started.</p>
          <Link href="/login?from=signup" className="btn btn-primary inline-flex">Sign in</Link>
        </div>
      ) : null}
      {state === "failed" ? (
        <div className="mt-6 text-sm">
          <p role="alert">{error}</p>
          <p className="mt-3 text-muted-foreground">Request a new link if yours expired or was already used.</p>
          <ResendVerification />
        </div>
      ) : null}
    </div>
  );
}
