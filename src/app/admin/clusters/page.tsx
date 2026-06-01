import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { aggregateNews } from "@/lib/rss";
import { clusterStories } from "@/lib/clustering";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Story Clusters — Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminClustersPage() {
  const items = await aggregateNews({ limit: 120 });
  const clusters = clusterStories(items).slice(0, 25);

  return (
    <main>
      <Header title="Story Clusters" subtitle="Duplicate & Coverage Groups" />
      <section className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <p className="text-sm text-[var(--text-muted)]">
          {clusters.length} multi-source clusters detected (2+ distinct publishers).
        </p>
        {clusters.map((c) => (
          <div key={c.id} className="rounded-2xl glass p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="chip chip-rss">{c.category}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(c.updatedAt)}</span>
            </div>
            <p className="font-semibold text-sm text-[var(--text-primary)]">{c.title}</p>
            <div className="flex flex-wrap gap-1.5">
              {c.sources.map((s) => <span key={s} className="chip text-[var(--accent-dim)]">{s}</span>)}
            </div>
            <p className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-wider">
              {c.items.length} articles · {c.sources.length} sources
            </p>
          </div>
        ))}
        {clusters.length === 0 && (
          <div className="rounded-2xl glass p-12 text-center text-[var(--text-muted)]">No clusters right now.</div>
        )}
        <Link href="/admin" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]">← Back to admin</Link>
      </section>
    </main>
  );
}
