"use client";

import type { StoryCluster } from "@/lib/clustering";
import { NewsCard } from "./NewsCard";
import { timeAgo } from "@/lib/utils";
import { useState } from "react";

export function StoryClusterCard({ cluster }: { cluster: StoryCluster }) {
  const [open, setOpen] = useState(false);
  const lead = cluster.items[0];

  return (
    <div className="rounded-2xl glass-strong p-5 space-y-3 fade-up">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="chip chip-rss">{cluster.category}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">
          {cluster.sources.length} sources covering this
        </span>
        <span className="text-[10px] text-[var(--text-muted)]">· {timeAgo(cluster.updatedAt)}</span>
      </div>

      <h3 className="font-display text-lg font-bold leading-snug text-[var(--text-primary)]">
        {cluster.title}
      </h3>
      {lead.summary && (
        <p className="text-sm text-[var(--text-muted)] line-clamp-2">{lead.summary}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {cluster.sources.map((src) => (
          <span key={src} className="chip text-[var(--accent-dim)]">{src}</span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] hover:underline"
      >
        {open ? "Hide coverage" : `View all ${cluster.items.length} stories →`}
      </button>

      {open && (
        <div className="grid gap-3 sm:grid-cols-2 pt-2">
          {cluster.items.map((item, i) => (
            <NewsCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
