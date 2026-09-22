"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, sessionMessage } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      const reason = sessionMessage ? "session_expired" : "authentication_required";
      router.replace(`/login?reason=${reason}`);
    }
  }, [loading, router, sessionMessage, user]);

  if (loading || !user) {
    return <LoadingSkeleton variant="page" />;
  }

  return <>{children}</>;
}
