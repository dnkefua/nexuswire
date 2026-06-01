import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { IngestButton } from "@/components/IngestButton";
import { ArticleStatusControls } from "@/components/ArticleStatusControls";
import { listArticles, hasPersistedArticles } from "@/lib/repositories/articles";
import { aggregateNews } from "@/lib/rss";
import { toNormalized } from "@/lib/repositories/articles";
import { timeAgo } from "@/lib/utils";
import type { NormalizedArticle } from "@/lib/types";
import Link from "next/link";

export const metadata: Metadata = { title: "Article Review — Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const persisted = await hasPersistedArticles();
  let articles: NormalizedArticle[];

  if (persisted) {
    articles = await listArticles({ limit: 80, includeReported: true });
  } else {
    // Fall back to a live snapshot so the queue is never empty during review.
    const live = await aggregateNews({ limit: 60 });
    articles = live.map(toNormalized);
  }

  return (
    <main>
      <Header title="Article Review" subtitle="Ingestion Queue" />
      <section className="mx-auto max-w-5xl px-4 py-8 space-y-4">
        <div className="rounded-2xl glass-strong p-5 space-y-3">
          <p className="text-sm text-[var(--text-muted)]">
            {persisted
              ? `${articles.length} articles in the persisted store (one document per article).`
              : `Store empty — showing a live snapshot. Run ingestion to persist articles.`}
          </p>
          <IngestButton />
        </div>

        <div className="rounded-2xl glass-strong overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                <th className="p-3">Title</th>
                <th className="p-3">Source</th>
                <th className="p-3">Cred.</th>
                <th className="p-3">Age</th>
                <th className="p-3">Moderation</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => {
                return (
                  <tr key={a.id} className="border-b border-[var(--border)]/40">
                    <td className="p-3 max-w-sm">
                      <a href={a.originalLink} target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:text-[var(--accent)] line-clamp-1">
                        {a.title}
                      </a>
                    </td>
                    <td className="p-3 text-[var(--text-muted)] whitespace-nowrap">{a.sourceName}</td>
                    <td className="p-3 text-[var(--text-muted)]">{a.credibilityScore ?? "—"}</td>
                    <td className="p-3 text-[var(--text-muted)] whitespace-nowrap">{timeAgo(a.publishedAt)}</td>
                    <td className="p-3">
                      <ArticleStatusControls id={a.id} status={a.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Link href="/admin" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]">← Back to admin</Link>
      </section>
    </main>
  );
}
