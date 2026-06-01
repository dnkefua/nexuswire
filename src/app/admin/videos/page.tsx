import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { aggregateNews } from "@/lib/rss";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Video News — Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const videos = await aggregateNews({ type: "youtube", limit: 40 });

  return (
    <main>
      <Header title="Video News" subtitle="YouTube Channels" />
      <section className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <p className="text-sm text-[var(--text-muted)]">
          {videos.length} videos from trusted channels. Uses channel RSS by default; set
          <code className="text-[var(--gold)]"> YOUTUBE_API_KEY</code> for richer Data API metadata.
        </p>
        <div className="rounded-2xl glass-strong overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                <th className="p-3">Title</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Published</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v.id} className="border-b border-[var(--border)]/40">
                  <td className="p-3 max-w-sm">
                    <a href={v.link} target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:text-[var(--accent)] line-clamp-1">
                      {v.title}
                    </a>
                  </td>
                  <td className="p-3 text-[var(--text-muted)] whitespace-nowrap">{v.source}</td>
                  <td className="p-3 text-[var(--text-muted)] whitespace-nowrap">{timeAgo(v.publishedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/admin" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]">← Back to admin</Link>
      </section>
    </main>
  );
}
