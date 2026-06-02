"use client";

import { useState } from "react";
import { useSaved } from "@/lib/saved-client";
import type { NewsItem } from "@/lib/types";

interface Props {
  item: Pick<NewsItem, "id" | "title" | "summary" | "link" | "source" | "image" | "publishedAt" | "sourceType" | "category" | "region" | "country">;
}

export function StoryActions({ item }: Props) {
  const { isSaved, save, remove } = useSaved();
  const saved = isSaved(item.id);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  function handleSave() {
    if (saved) {
      remove(item.id);
    } else {
      save({
        id: item.id,
        title: item.title,
        summary: item.summary,
        link: item.link,
        source: item.source,
        image: item.image,
        publishedAt: item.publishedAt,
        sourceType: item.sourceType,
        category: item.category,
        region: item.region,
        country: item.country,
      });
    }
  }

  async function handleShare() {
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text: item.summary, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled share
    } finally {
      setSharing(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleSave}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
          saved
            ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
            : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
        }`}
      >
        <span>{saved ? "★" : "☆"}</span>
        {saved ? "Saved" : "Save"}
      </button>

      <button
        type="button"
        onClick={handleShare}
        disabled={sharing}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <span>↗</span> Share
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <span>⧉</span> {copied ? "Copied!" : "Copy link"}
      </button>

      <a
        href={`/report?url=${encodeURIComponent(item.link)}&title=${encodeURIComponent(item.title)}&source=${encodeURIComponent(item.source)}`}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] transition-all hover:border-[var(--danger)] hover:text-[var(--danger)]"
      >
        <span>⚑</span> Report
      </a>

      {item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] transition-all hover:bg-[var(--accent)]/10"
        >
          <span>→</span> Original
        </a>
      )}
    </div>
  );
}
