"use client";

import { useState } from "react";
import type { NewsItem } from "@/lib/types";
import type { ArticleAIEnrichment } from "@/lib/ai";

export function AiInsights({ item }: { item: Partial<NewsItem> }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "unavailable" | "error">("idle");
  const [data, setData] = useState<ArticleAIEnrichment | null>(null);

  async function generate() {
    setState("loading");
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const json = (await res.json()) as { enrichment: ArticleAIEnrichment | null; aiAvailable?: boolean };
      if (json.aiAvailable === false) {
        setState("unavailable");
        return;
      }
      if (!json.enrichment) {
        setState("error");
        return;
      }
      setData(json.enrichment);
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "idle") {
    return (
      <div className="rounded-xl border border-[var(--border)] p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">AI Context</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Generate &ldquo;Why it matters&rdquo; &amp; key entities from this preview.</p>
        </div>
        <button type="button" onClick={generate} className="btn-ghost text-xs whitespace-nowrap">
          ✦ Generate
        </button>
      </div>
    );
  }

  if (state === "loading") {
    return <div className="h-24 animate-pulse rounded-xl glass" />;
  }

  if (state === "unavailable") {
    return (
      <div className="rounded-xl border border-[var(--border)] p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">AI Context</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          AI summaries are not enabled on this deployment. Configure <code className="text-[var(--gold)]">GEMINI_API_KEY</code> to activate.
        </p>
      </div>
    );
  }

  if (state === "error" || !data) {
    return (
      <div className="rounded-xl border border-[var(--border)] p-4">
        <p className="text-xs text-[var(--text-muted)]">Could not generate AI context right now.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">AI Summary</span>
        <span className="chip" style={{ fontSize: 8, background: "rgba(212,168,83,0.12)", color: "var(--gold)", borderColor: "rgba(212,168,83,0.35)" }}>
          AI-generated
        </span>
      </div>

      {data.shortSummary && <p className="text-sm text-[var(--text-primary)] leading-relaxed">{data.shortSummary}</p>}

      {data.whyItMatters?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)] mb-1.5">Why it matters</p>
          <ul className="space-y-1">
            {data.whyItMatters.map((w, i) => (
              <li key={i} className="flex gap-2 text-xs text-[var(--text-muted)]">
                <span className="text-[var(--accent)]">◈</span>{w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.keyEntities && (
        <div className="flex flex-wrap gap-1.5">
          {[...(data.keyEntities.countries || []), ...(data.keyEntities.organizations || []), ...(data.keyEntities.people || [])]
            .slice(0, 10)
            .map((e) => (
              <span key={e} className="chip">{e}</span>
            ))}
        </div>
      )}

      <p className="text-[9px] text-[var(--text-muted)]/60">
        AI summary derived from the source excerpt. May contain errors — always read the original at the publisher.
      </p>
    </div>
  );
}
