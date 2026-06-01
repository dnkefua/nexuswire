"use client";

import { useEffect, useState } from "react";
import { authHeaders } from "@/lib/user-client";
import { useUser } from "@/context/UserContext";
import { Header } from "@/components/Header";

type State = "checking" | "allowed" | "denied";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { currentUser, openAuth } = useUser();
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let ignore = false;
    async function check() {
      try {
        const res = await fetch("/api/admin/me", { headers: await authHeaders() });
        const data = (await res.json()) as { admin?: boolean };
        if (!ignore) setState(data.admin ? "allowed" : "denied");
      } catch {
        if (!ignore) setState("denied");
      }
    }
    void check();
    return () => { ignore = true; };
  }, [currentUser]);

  if (state === "allowed") return <>{children}</>;

  return (
    <main>
      <Header title="Admin" subtitle="Restricted Area" />
      <section className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        {state === "checking" ? (
          <div className="h-40 animate-pulse rounded-3xl glass" />
        ) : (
          <div className="rounded-3xl glass-strong p-8 space-y-4 fade-up">
            <div className="text-4xl">🔒</div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Admin access required</h2>
            <p className="text-sm text-[var(--text-muted)]">
              This area is restricted to authorized administrators. Sign in with an allowlisted account
              (configured via <code className="text-[var(--gold)]">ADMIN_EMAILS</code>).
            </p>
            {!currentUser && (
              <button type="button" onClick={() => openAuth("login")} className="btn-primary">
                Sign In
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
