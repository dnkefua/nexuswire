"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import type { FeedSource } from "@/lib/types";

function credColor(score?: number): string {
  if (!score) return "var(--text-muted)";
  if (score >= 85) return "var(--success)";
  if (score >= 70) return "var(--gold)";
  return "var(--danger)";
}

export default function SourcesPage() {
  const [feeds, setFeeds] = useState<FeedSource[]>([]);

  useEffect(() => {
    fetch("/api/feeds")
      .then((r) => r.json())
      .then((d) => setFeeds(d.feeds || []));
  }, []);

  const byRegion = feeds.reduce<Record<string, FeedSource[]>>((acc, f) => {
    if (!acc[f.region]) acc[f.region] = [];
    acc[f.region].push(f);
    return acc;
  }, {});

  const REGION_ORDER = ["West Africa", "East Africa", "Central Africa", "Southern Africa", "North Africa", "Pan-African", "Global"];
  const regions = Object.keys(byRegion).sort(
    (a, b) => (REGION_ORDER.indexOf(a) + 99) % 100 - ((REGION_ORDER.indexOf(b) + 99) % 100)
  );

  return (
    <main>
      <Header title="Source Registry" subtitle="Trusted African & Global Publishers" />

      <section className="mx-auto max-w-6xl px-4 py-6">
        <p className="mb-6 text-sm text-[var(--text-muted)]">
          NexusWire aggregates from {feeds.length} verified publisher feeds, regional outlets, and Google News discovery.
          Each source carries a credibility score — discovery feeds never outrank verified publishers.
        </p>

        {regions.map((region) => (
          <div key={region} className="mb-8">
            <h3 className="font-display mb-3 text-xs font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
              {region} · {byRegion[region].length}
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {byRegion[region]
                .sort((a, b) => (b.credibilityScore ?? 0) - (a.credibilityScore ?? 0))
                .map((s) => (
                  <li key={s.id} className="rounded-xl glass p-4 transition-all hover:glow-border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{s.name}</p>
                          {s.googleNews && (
                            <span className="chip" style={{ fontSize: 8 }}>Discovery</span>
                          )}
                        </div>
                        <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                          {s.category} · {s.country}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`chip ${s.type === "youtube" ? "chip-youtube" : s.type === "blog" ? "chip-blog" : "chip-rss"}`}>
                          {s.type}
                        </span>
                        {s.credibilityScore != null && (
                          <span className="text-[10px] font-bold" style={{ color: credColor(s.credibilityScore) }}>
                            {s.credibilityScore}/100
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 truncate text-[10px] text-[var(--accent-dim)] opacity-70">{s.url}</p>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
