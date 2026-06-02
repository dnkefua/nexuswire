"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { EngagementBar } from "@/components/EngagementBar";
import { CommentSection } from "@/components/CommentSection";
import { SourceTransparencyCard } from "@/components/SourceTransparencyCard";
import type { NewsItem } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export default function LivePage() {
  const [videos, setVideos] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<NewsItem | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/news?type=youtube&limit=200")
      .then((r) => r.json())
      .then((d: { items?: NewsItem[] }) => {
        const items = d.items || [];

        const params = new URLSearchParams(window.location.search);
        const queryVideoId = params.get("v") || params.get("id");

        if (queryVideoId) {
          const found = items.find((v) => v.videoId === queryVideoId);
          if (found) {
            setVideos(items);
            setActive(found);
          } else {
            const title = params.get("title") || "Selected Video";
            const source = params.get("source") || "Video Feed";
            const summary = params.get("summary") || "";

            const tempItem: NewsItem = {
              id: `temp-${queryVideoId}`,
              title: decodeURIComponent(title),
              summary: decodeURIComponent(summary),
              link: `https://www.youtube.com/watch?v=${queryVideoId}`,
              image: `https://i.ytimg.com/vi/${queryVideoId}/hqdefault.jpg`,
              source: decodeURIComponent(source),
              sourceType: "youtube",
              category: "Live",
              region: "Global",
              country: "Global",
              publishedAt: new Date().toISOString(),
              author: decodeURIComponent(source),
              isLive: false,
              videoId: queryVideoId,
            };

            setVideos([tempItem, ...items]);
            setActive(tempItem);
          }
        } else {
          setVideos(items);
          setActive(items[0] || null);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <Header title="Live Hub" subtitle="YouTube & Video Feeds" />

      <section className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {loading ? (
          <div className="aspect-video animate-pulse rounded-2xl glass" />
        ) : error ? (
          <div className="rounded-2xl glass p-12 text-center space-y-3">
            <p className="text-[var(--text-muted)]">Unable to load latest videos.</p>
            <p className="text-xs text-[var(--text-muted)]/60">Check your connection or visit channels directly on YouTube.</p>
          </div>
        ) : active?.videoId ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl glow-border">
              <div className="relative aspect-video bg-black">
                <iframe
                  title={active.title}
                  src={`https://www.youtube.com/embed/${active.videoId}?autoplay=0&rel=0`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="glass-strong p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="chip chip-youtube">YouTube</span>
                  <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
                    {active.source}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">· {timeAgo(active.publishedAt)}</span>
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {active.title}
                </h2>
                {active.summary && (
                  <p className="text-sm text-[var(--text-muted)]">{active.summary}</p>
                )}
                <a
                  href={active.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)] hover:underline"
                >
                  Watch on YouTube →
                </a>
                {active.videoId && (
                  <div className="border-t border-[var(--border)] pt-4">
                    <EngagementBar
                      targetType="video"
                      targetId={active.videoId}
                      onCommentClick={() => setShowComments((v) => !v)}
                    />
                    {showComments && (
                      <div className="mt-4">
                        <CommentSection targetType="video" targetId={active.videoId} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Source transparency for video */}
            <SourceTransparencyCard
              item={{
                source: active.source,
                sourceType: "youtube",
                link: active.link,
                region: active.region,
                country: active.country,
                category: active.category,
                publishedAt: active.publishedAt,
              }}
            />

            <div className="rounded-xl border border-[var(--border)] p-3 text-[10px] text-[var(--text-muted)] text-center">
              Video sourced from {active.source} via official YouTube embed. NexusWire does not host this video.
            </div>
          </div>
        ) : (
          <div className="rounded-2xl glass p-12 text-center space-y-3">
            <p className="text-[var(--text-muted)]">No video feeds available right now.</p>
            <p className="text-xs text-[var(--text-muted)]/60">Try refreshing or check back shortly.</p>
          </div>
        )}

        {videos.length > 0 && (
          <>
            <h3 className="font-display mt-6 text-sm font-bold tracking-[0.15em] text-[var(--accent)] uppercase">
              Channel Queue
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => { setActive(v); setShowComments(false); }}
                  className={`flex gap-3 rounded-xl p-3 text-left transition-all glass hover:glow-border ${
                    active?.id === v.id ? "ring-1 ring-[var(--accent)]" : ""
                  }`}
                >
                  {v.image && (
                    <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image src={v.image} alt="" fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-semibold">{v.title}</p>
                    <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                      {v.source} · {timeAgo(v.publishedAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
