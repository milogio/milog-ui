"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { MiLogTenant, MiLogUser } from "@/lib/types";

type AuthState = {
  user: MiLogUser | null;
  tenant: MiLogTenant | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setSession: (session: { user: MiLogUser; tenant: MiLogTenant }) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MiLogUser | null>(null);
  const [tenant, setTenant] = useState<MiLogTenant | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/session", { credentials: "include" });
      if (!response.ok) {
        setUser(null);
        setTenant(null);
        return;
      }
      const payload = (await response.json()) as { user: MiLogUser; tenant: MiLogTenant };
      setUser(payload.user);
      setTenant(payload.tenant);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadSession() {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/session", { credentials: "include" });
        if (!response.ok) {
          if (!ignore) {
            setUser(null);
            setTenant(null);
          }
          return;
        }
        const payload = (await response.json()) as { user: MiLogUser; tenant: MiLogTenant };
        if (!ignore) {
          setUser(payload.user);
          setTenant(payload.tenant);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      ignore = true;
    };
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setTenant(null);
  }, []);

  const setSession = useCallback((session: { user: MiLogUser; tenant: MiLogTenant }) => {
    setUser(session.user);
    setTenant(session.tenant);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ user, tenant, loading, refresh, logout, setSession }),
    [loading, logout, refresh, setSession, tenant, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
