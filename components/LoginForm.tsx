"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { login } from "@/lib/milogApi";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { LogoMark } from "@/components/LogoMark";

export function LoginForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const { pushToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="panel w-full max-w-md rounded-[2rem] p-8">
      <div className="flex items-center gap-4">
        <LogoMark />
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted">MiLog</p>
          <h1 className="mt-1 text-2xl font-semibold">Welcome back</h1>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-muted">
        Sign in to inspect your tenant timeline, export signal, and share the story behind every event.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError("");
          try {
            const session = await login(email, password);
            setSession(session);
            pushToast({ title: "Welcome to MiLog.", tone: "success" });
            router.push("/timeline");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <label className="block space-y-2 text-sm">
          <span className="text-muted">Email</span>
          <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="text-muted">Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <p className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-200">{error}</p> : null}

        <button className="btn btn-primary w-full justify-center py-3" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
          {!loading ? <ArrowRight className="size-4" /> : null}
        </button>
      </form>
    </div>
  );
}
