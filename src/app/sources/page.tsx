"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import type { FeedSource } from "@/lib/types";

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

  return (
    <main>
      <Header title="Feed Matrix" subtitle="RSS · Blogs · YouTube" />

      <section className="mx-auto max-w-6xl px-4 py-6">
        <p className="mb-6 text-sm text-[var(--text-muted)]">
          NexusWire pulls free public feeds — no API keys required. YouTube channels
          use official RSS endpoints; news outlets use standard RSS/Atom.
        </p>

        {Object.entries(byRegion).map(([region, sources]) => (
          <div key={region} className="mb-8">
            <h3 className="font-display mb-3 text-xs font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
              {region}
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {sources.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl glass p-4 transition-all hover:glow-border"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{s.name}</p>
                      <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                        {s.category} · {s.country}
                      </p>
                    </div>
                    <span
                      className={`chip ${
                        s.type === "youtube"
                          ? "chip-youtube"
                          : s.type === "blog"
                            ? "chip-blog"
                            : "chip-rss"
                      }`}
                    >
                      {s.type}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-[10px] text-[var(--accent-dim)] opacity-70">
                    {s.url}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
