"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { StoryClusterCard } from "@/components/StoryClusterCard";
import type { StoryCluster } from "@/lib/clustering";

export default function TrendingPage() {
  const [clusters, setClusters] = useState<StoryCluster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clusters?limit=15")
      .then((r) => r.json())
      .then((d: { clusters?: StoryCluster[] }) => setClusters(d.clusters || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <Header title="Trending Clusters" subtitle="Multi-Source Coverage" />
      <section className="mx-auto max-w-4xl px-4 py-6 space-y-5">
        <p className="text-sm text-[var(--text-muted)]">
          Stories covered by multiple trusted sources, grouped automatically. Each cluster shows every publisher reporting the story.
        </p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 animate-pulse rounded-2xl glass" />
            ))}
          </div>
        ) : clusters.length === 0 ? (
          <div className="rounded-2xl glass p-12 text-center text-[var(--text-muted)]">
            No multi-source clusters detected right now. Check back as more stories come in.
          </div>
        ) : (
          clusters.map((c) => <StoryClusterCard key={c.id} cluster={c} />)
        )}
      </section>
    </main>
  );
}
