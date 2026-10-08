"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { MiLogTenant, MiLogUser } from "@/lib/types";
import type { ApiEntitlement } from "@/lib/apiContract";
import { getEntitlement } from "@/lib/accountApi";

type AuthState = {
  user: MiLogUser | null;
  tenant: MiLogTenant | null;
  entitlement: ApiEntitlement | null;
  loading: boolean;
  sessionMessage: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setSession: (session: { user: MiLogUser; tenant: MiLogTenant }) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MiLogUser | null>(null);
  const [tenant, setTenant] = useState<MiLogTenant | null>(null);
  const [entitlement, setEntitlement] = useState<ApiEntitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const sessionRevision = useRef(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/session", { credentials: "include" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setSessionMessage(payload?.message ?? null);
        setUser(null);
        setTenant(null);
        setEntitlement(null);
        return;
      }
      const payload = (await response.json()) as { user: MiLogUser; tenant: MiLogTenant };
      setUser(payload.user);
      setTenant(payload.tenant);
      setSessionMessage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const requestRevision = sessionRevision.current;

    async function loadSession() {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/session", { credentials: "include" });
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { message?: string } | null;
          if (!ignore && sessionRevision.current === requestRevision) {
            setSessionMessage(payload?.message ?? null);
            setUser(null);
            setTenant(null);
            setEntitlement(null);
          }
          return;
        }
        const payload = (await response.json()) as { user: MiLogUser; tenant: MiLogTenant };
        if (!ignore && sessionRevision.current === requestRevision) {
          setUser(payload.user);
          setTenant(payload.tenant);
          setSessionMessage(null);
        }
      } finally {
        if (!ignore && sessionRevision.current === requestRevision) {
          setLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      ignore = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (!user || !tenant) return;
    let cancelled = false;
    void getEntitlement().then((value) => {
      if (!cancelled && value?.state) setEntitlement(value);
    }).catch(() => {
      if (!cancelled) setEntitlement(null);
    });
    return () => { cancelled = true; };
  }, [user, tenant]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    sessionRevision.current += 1;
    setUser(null);
    setTenant(null);
    setEntitlement(null);
    setSessionMessage(null);
  }, []);

  const setSession = useCallback((session: { user: MiLogUser; tenant: MiLogTenant }) => {
    sessionRevision.current += 1;
    setUser(session.user);
    setTenant(session.tenant);
    setEntitlement(null);
    setSessionMessage(null);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ user, tenant, entitlement, loading, sessionMessage, refresh, logout, setSession }),
    [entitlement, loading, logout, refresh, sessionMessage, setSession, tenant, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
