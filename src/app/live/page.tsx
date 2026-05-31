"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { EngagementBar } from "@/components/EngagementBar";
import { CommentSection } from "@/components/CommentSection";
import type { NewsItem } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export default function LivePage() {
  const [videos, setVideos] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<NewsItem | null>(null);

  useEffect(() => {
    fetch("/api/news?type=youtube&limit=12")
      .then((r) => r.json())
      .then((d) => {
        const items = d.items || [];
        setVideos(items);
        setActive(items[0] || null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <Header title="Live Hub" subtitle="YouTube & Video Feeds" />

      <section className="mx-auto max-w-6xl px-4 py-6">
        {loading ? (
          <div className="aspect-video animate-pulse rounded-2xl glass" />
        ) : active?.videoId ? (
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
            <div className="glass-strong p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="live-dot h-2 w-2 rounded-full" />
                <span className="text-[10px] font-bold tracking-widest text-[var(--danger)] uppercase">
                  {active.source}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {active.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{active.summary}</p>
              {active.videoId && (
                <div className="mt-4 border-t border-[var(--border)] pt-4">
                  <EngagementBar
                    targetType="video"
                    targetId={active.videoId}
                  />
                  <CommentSection targetType="video" targetId={active.videoId} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-[var(--text-muted)]">No live video feeds available.</p>
        )}

        <h3 className="font-display mt-10 mb-4 text-sm font-bold tracking-[0.15em] text-[var(--accent)] uppercase">
          Channel Queue
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setActive(v)}
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
      </section>
    </main>
  );
}
