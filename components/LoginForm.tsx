"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Terminal } from "lucide-react";
import { login } from "@/lib/milogApi";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { LogoMark } from "@/components/LogoMark";

export function LoginForm({ nextPath = "/timeline", reason }: { nextPath?: string; reason?: string }) {
  const router = useRouter();
  const { setSession } = useAuth();
  const { pushToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <LogoMark />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">MiLog</p>
          <h1 className="mt-1 text-xl font-semibold tracking-normal">Welcome back</h1>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-muted-foreground">
        Sign in to inspect your tenant timeline, export signal, and share the story behind every event.
      </p>

      {reason === "session_expired" ? (
        <p className="mt-4 rounded-md border border-level-warn/30 bg-level-warn/10 px-3 py-2 text-sm text-foreground">
          Your session expired or was revoked. Please sign in again.
        </p>
      ) : null}

      <div className="mt-5 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
        <Terminal className="h-3.5 w-3.5 text-brand" />
        milog auth session
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError("");
          try {
            const session = await login(email, password);
            setSession(session);
            pushToast({ title: "Welcome to MiLog.", tone: "success" });
            router.push(nextPath);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <label className="block space-y-2 text-sm">
          <span className="text-muted-foreground">Email</span>
          <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="text-muted-foreground">Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
            {error}
          </p>
        ) : null}

        <button className="btn btn-primary w-full justify-center py-2.5" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
          {!loading ? <ArrowRight className="size-4" /> : null}
        </button>
      </form>
    </div>
  );
}
