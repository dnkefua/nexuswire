"use client";

import { useEffect, useState } from "react";

interface ExcerptData {
  ok: boolean;
  paragraphs: string[];
  shownParagraphs: number;
  totalParagraphs: number;
  truncated: boolean;
}

interface Props {
  url: string;
  source: string;
  /** RSS summary used as a fallback when extraction fails. */
  fallbackSummary?: string;
  previewFraction: number;
}

export function ArticleExcerpt({ url, source, fallbackSummary, previewFraction }: Props) {
  const [data, setData] = useState<ExcerptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const params = new URLSearchParams({
      url,
      fraction: String(previewFraction),
    });
    fetch(`/api/article-preview?${params}`)
      .then((r) => r.json())
      .then((d: ExcerptData) => {
        if (!ignore) setData(d);
      })
      .catch(() => !ignore && setData(null))
      .finally(() => !ignore && setLoading(false));
    return () => { ignore = true; };
  }, [url, previewFraction]);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
        <div className="h-3 w-full animate-pulse rounded bg-white/5" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-white/5" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-white/5" />
      </div>
    );
  }

  const pct = data?.ok && data.totalParagraphs
    ? Math.round((data.shownParagraphs / data.totalParagraphs) * 100)
    : Math.round(previewFraction * 100);

  // Fallback to RSS summary if extraction didn't yield content.
  if (!data?.ok || data.paragraphs.length === 0) {
    return fallbackSummary ? (
      <div className="space-y-3">
        <div className="border-l-2 border-[var(--accent)] pl-4 text-sm md:text-base leading-relaxed text-[var(--text-muted)]">
          {fallbackSummary}
        </div>
        <p className="text-[10px] text-[var(--text-muted)]/60">
          Preview excerpt provided by the publisher feed. Continue to {source} for 100% of the story.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2"
        >
          Read 100% at {source} →
        </a>
      </div>
    ) : null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="chip" style={{ background: "rgba(212,168,83,0.12)", color: "var(--gold)", borderColor: "rgba(212,168,83,0.35)" }}>
          Preview · ~{pct}% of article
        </span>
      </div>

      <div className="space-y-3 text-sm md:text-base leading-relaxed text-[var(--text-primary)]/90 border-l-2 border-[var(--accent)] pl-4">
        {data.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {data.truncated && (
        <div className="relative">
          {/* Fade-out to signal there's more at the source */}
          <div className="h-8 -mt-8 bg-gradient-to-t from-[var(--bg-elevated)] to-transparent pointer-events-none" />
          <div className="rounded-xl border border-[var(--border)] bg-[var(--accent)]/5 p-4 text-center space-y-2">
            <p className="text-xs text-[var(--text-muted)]">
              You&apos;ve read a preview of this story. Continue to the original publisher for 100% of the story.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-2.5"
            >
              Read 100% at {source} →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
