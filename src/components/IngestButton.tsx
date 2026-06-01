"use client";

import { useState } from "react";

interface Summary {
  sourcesChecked: number;
  articlesCreated: number;
  articlesUpdated: number;
  sourcesFailed: number;
}

export function IngestButton() {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [summary, setSummary] = useState<Summary | null>(null);

  async function run() {
    setState("running");
    try {
      const res = await fetch("/api/cron/ingest-news", { method: "POST" });
      if (!res.ok) {
        setState("error");
        return;
      }
      setSummary((await res.json()) as Summary);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button type="button" onClick={run} disabled={state === "running"} className="btn-primary">
        {state === "running" ? "Ingesting…" : "↻ Run ingestion now"}
      </button>
      {state === "done" && summary && (
        <span className="text-xs text-[var(--success)]">
          ✓ {summary.articlesCreated} new · {summary.articlesUpdated} updated · {summary.sourcesFailed} failed
        </span>
      )}
      {state === "error" && (
        <span className="text-xs text-[var(--danger)]">Ingestion requires a secret in production.</span>
      )}
    </div>
  );
}
