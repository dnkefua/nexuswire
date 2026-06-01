"use client";

import type { NewsItem } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

interface Props {
  item: Partial<NewsItem> & {
    source: string;
    sourceType: NewsItem["sourceType"];
    originalFeedUrl?: string;
    lastFetchedAt?: string;
  };
}

const typeLabel: Record<string, string> = {
  rss: "RSS Feed",
  blog: "Blog",
  youtube: "YouTube Channel",
};

export function SourceTransparencyCard({ item }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[rgba(10,16,28,0.6)] p-4 text-xs text-[var(--text-muted)] space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/25 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5 0a5 5 0 100 10A5 5 0 005 0zm.5 7.5h-1v-3h1v3zm0-4h-1v-1h1v1z"/>
          </svg>
          Source Transparency
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {item.source && (
          <>
            <span className="text-[var(--text-muted)]/70 uppercase tracking-wider text-[9px]">Publisher</span>
            <span className="font-semibold text-[var(--text-primary)]">{item.source}</span>
          </>
        )}
        <span className="text-[var(--text-muted)]/70 uppercase tracking-wider text-[9px]">Type</span>
        <span className="font-semibold text-[var(--text-primary)]">{typeLabel[item.sourceType] || item.sourceType}</span>

        {item.region && (
          <>
            <span className="text-[var(--text-muted)]/70 uppercase tracking-wider text-[9px]">Region</span>
            <span>{item.region}</span>
          </>
        )}
        {item.country && (
          <>
            <span className="text-[var(--text-muted)]/70 uppercase tracking-wider text-[9px]">Country</span>
            <span>{item.country}</span>
          </>
        )}
        {item.category && (
          <>
            <span className="text-[var(--text-muted)]/70 uppercase tracking-wider text-[9px]">Category</span>
            <span>{item.category}</span>
          </>
        )}
        {item.publishedAt && (
          <>
            <span className="text-[var(--text-muted)]/70 uppercase tracking-wider text-[9px]">Published</span>
            <span>{timeAgo(item.publishedAt)}</span>
          </>
        )}
        {item.lastFetchedAt && (
          <>
            <span className="text-[var(--text-muted)]/70 uppercase tracking-wider text-[9px]">Fetched</span>
            <span>{timeAgo(item.lastFetchedAt)}</span>
          </>
        )}
      </div>

      {item.link && (
        <div className="pt-1">
          <span className="text-[var(--text-muted)]/70 uppercase tracking-wider text-[9px] block mb-1">Original URL</span>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline break-all line-clamp-1"
          >
            {item.link}
          </a>
        </div>
      )}

      {item.originalFeedUrl && (
        <div>
          <span className="text-[var(--text-muted)]/70 uppercase tracking-wider text-[9px] block mb-1">Feed URL</span>
          <span className="break-all line-clamp-1 text-[var(--text-muted)]">{item.originalFeedUrl}</span>
        </div>
      )}

      <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--accent)]/5 p-3 text-[10px] leading-relaxed">
        <p className="font-semibold text-[var(--text-primary)] mb-1">Why am I seeing this?</p>
        <p>NexusWire aggregates publicly available headlines from trusted publishers. This is a source-attributed preview — the full article remains with the original publisher.</p>
      </div>
    </div>
  );
}
