"use client";

import { Header } from "@/components/Header";
import { useSaved } from "@/lib/saved-client";
import { timeAgo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function SavedPage() {
  const { saved, remove } = useSaved();

  return (
    <main>
      <Header title="Saved" subtitle="Your Reading List" />
      <section className="mx-auto max-w-4xl px-4 py-6">
        {saved.length === 0 ? (
          <div className="rounded-3xl glass p-16 text-center space-y-4 fade-up">
            <p className="text-4xl">☆</p>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Nothing saved yet</h2>
            <p className="text-sm text-[var(--text-muted)]">Save articles from the main feed to read them later.</p>
            <Link href="/" className="btn-primary inline-block mt-2">Browse the Wire</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-widest mb-4">
              {saved.length} saved {saved.length === 1 ? "article" : "articles"}
            </p>
            {saved.map((item) => {
              const readHref = `/read?id=${item.id}&title=${encodeURIComponent(item.title)}&summary=${encodeURIComponent(item.summary || "")}&image=${encodeURIComponent(item.image || "")}&source=${encodeURIComponent(item.source)}&link=${encodeURIComponent(item.link)}&publishedAt=${encodeURIComponent(item.publishedAt)}`;
              return (
                <div key={item.id} className="rounded-2xl glass p-4 flex gap-4 fade-up items-start">
                  {item.image && (
                    <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-black/40">
                      <Image src={item.image} alt="" fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-1.5">
                      <span className="chip chip-rss">{item.sourceType}</span>
                      <span className="chip">{item.category}</span>
                    </div>
                    <Link href={readHref} className="block font-semibold text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors line-clamp-2">
                      {item.title}
                    </Link>
                    <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                      <span className="text-[var(--accent-dim)] font-medium">{item.source}</span>
                      {" · "}
                      {timeAgo(item.publishedAt)}
                      {" · Saved "}
                      {timeAgo(item.savedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    title="Remove from saved"
                    className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors text-lg"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
