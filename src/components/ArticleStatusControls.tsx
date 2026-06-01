"use client";

import { useState } from "react";
import { authHeaders } from "@/lib/user-client";
import type { NormalizedArticle } from "@/lib/types";

type Status = NormalizedArticle["status"];

const ACTIONS: { label: string; status: Status; color: string }[] = [
  { label: "Approve", status: "active", color: "var(--success)" },
  { label: "Hide", status: "hidden", color: "var(--gold)" },
  { label: "Remove", status: "removed", color: "var(--danger)" },
];

export function ArticleStatusControls({ id, status }: { id: string; status: Status }) {
  const [current, setCurrent] = useState<Status>(status);
  const [busy, setBusy] = useState(false);

  async function set(next: Status) {
    if (next === current) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/articles/status", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ id, status: next }),
      });
      if (res.ok) setCurrent(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      {ACTIONS.map((a) => (
        <button
          key={a.status}
          type="button"
          disabled={busy || current === a.status}
          onClick={() => set(a.status)}
          className="rounded-md border border-[var(--border)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 hover:border-current"
          style={{ color: current === a.status ? a.color : "var(--text-muted)" }}
        >
          {current === a.status ? `● ${a.label}` : a.label}
        </button>
      ))}
    </div>
  );
}
