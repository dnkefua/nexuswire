"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NewsItem } from "@/lib/types";
import { newsHref, isInternalHref } from "@/lib/item-link";
import { timeAgo } from "@/lib/utils";

interface ResolvedLiveChannel {
  id: string;
  name: string;
  region: string;
  country: string;
  videoId: string;
  live: boolean;
  watchUrl: string;
}

/** A unified TV channel: either a 24/7 live stream or an on-demand feed video. */
interface Channel {
  key: string;
  title: string;
  source: string;
  region?: string;
  thumb?: string;
  live: boolean;
  embed: string;
  watchUrl: string;
  internal: boolean;
}

function videoEmbed(item: NewsItem): string {
  const common = "autoplay=1&mute=1&rel=0&playsinline=1&modestbranding=1";
  if (item.videoId) return `https://www.youtube.com/embed/${item.videoId}?${common}`;
  if (item.playlistId) return `https://www.youtube.com/embed/videoseries?list=${item.playlistId}&${common}`;
  return "";
}

function liveChannelEmbed(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&playsinline=1&modestbranding=1`;
}

export function LiveTv() {
  const [feedVideos, setFeedVideos] = useState<NewsItem[]>([]);
  const [liveChannels, setLiveChannels] = useState<ResolvedLiveChannel[]>([]);
  const [headlines, setHeadlines] = useState<NewsItem[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      fetch("/api/news?type=youtube&limit=30").then((r) => r.json()),
      fetch("/api/news?limit=24").then((r) => r.json()),
      fetch("/api/live-channels").then((r) => r.json()).catch(() => ({ channels: [] })),
    ])
      .then(([vids, news, live]: [{ items?: NewsItem[] }, { items?: NewsItem[] }, { channels?: ResolvedLiveChannel[] }]) => {
        if (ignore) return;
        const vlist = (vids.items || []).filter((v) => v.videoId || v.playlistId);
        const isAfrican = (v: NewsItem) => (v.region && v.region !== "Global" ? 0 : 1);
        vlist.sort((a, b) => isAfrican(a) - isAfrican(b));
        setFeedVideos(vlist);
        setHeadlines(news.items || []);
        setLiveChannels(live.channels || []);
      })
      .catch(() => {})
      .finally(() => !ignore && setLoading(false));
    return () => { ignore = true; };
  }, []);

  // Featured live channels (resolved to a real, playable video id server-side)
  // first, then on-demand feed videos. Both embed concrete videos, so the screen
  // is never the "video unavailable" live_stream offline state.
  const channels: Channel[] = useMemo(() => {
    const live: Channel[] = liveChannels.map((c) => ({
      key: c.id,
      title: c.live ? `${c.name} — Live` : `${c.name} — Latest`,
      source: c.name,
      region: c.region,
      live: c.live,
      embed: liveChannelEmbed(c.videoId),
      watchUrl: c.watchUrl,
      internal: false,
    }));
    const liveSources = new Set(liveChannels.map((c) => c.name));
    const onDemand: Channel[] = feedVideos
      // avoid duplicating a channel already featured in the live row
      .filter((v) => !liveSources.has(v.source))
      .map((v) => ({
        key: v.id,
        title: v.title,
        source: v.source,
        region: v.region,
        thumb: v.image,
        live: false,
        embed: videoEmbed(v),
        watchUrl: newsHref(v),
        internal: isInternalHref(v),
      }));
    return [...live, ...onDemand];
  }, [liveChannels, feedVideos]);

  const active = channels.find((c) => c.key === activeKey) || channels[0] || null;

  const marquee = useMemo(() => {
    const list = headlines.slice(0, 14);
    return list.length ? [...list, ...list] : [];
  }, [headlines]);

  return (
    <section className="mx-auto max-w-6xl px-3 pt-4 sm:px-4 sm:pt-6">
      <div className="overflow-hidden rounded-2xl sm:rounded-3xl glass-strong glow-border">
        {/* TV top bar */}
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-[var(--danger)] px-2 py-1">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" />
              <span className="text-[9px] font-black tracking-[0.2em] text-white uppercase">
                {active?.live ? "Live" : "On Air"}
              </span>
            </span>
            <span className="font-display truncate text-[11px] font-bold tracking-[0.18em] text-[var(--text-primary)] uppercase sm:text-xs">
              NexusWire&nbsp;TV
            </span>
            {active && (
              <span className="hidden truncate text-[10px] text-[var(--text-muted)] sm:inline">· {active.source}</span>
            )}
          </div>
          <Link href="/live" className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] hover:underline">
            Live Hub →
          </Link>
        </div>

        {/* TV screen */}
        <div className="relative aspect-video w-full bg-black">
          {loading ? (
            <div className="absolute inset-0 animate-pulse bg-white/5" />
          ) : active ? (
            <>
              <iframe
                key={active.key}
                title={active.title}
                src={active.embed}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              {active.internal ? (
                <Link href={active.watchUrl} className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 to-transparent p-3 pt-10 sm:p-4">
                  <p className="line-clamp-2 text-sm font-semibold text-white drop-shadow sm:text-base">{active.title}</p>
                  <p className="mt-0.5 text-[10px] text-white/70">{active.source} · open full coverage →</p>
                </Link>
              ) : (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 to-transparent p-3 pt-10 sm:p-4">
                  <p className="line-clamp-2 text-sm font-semibold text-white drop-shadow sm:text-base">{active.title}</p>
                  <p className="mt-0.5 text-[10px] text-white/70">
                    {active.live ? "Live broadcast" : active.source} · {active.source}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-center text-sm text-[var(--text-muted)]">
              <div>
                <p>Live channels are loading.</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]/60">Check back shortly or open the Live Hub.</p>
              </div>
            </div>
          )}
        </div>

        {/* Channel switcher */}
        {channels.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scroll-hide border-t border-[var(--border)] p-2 sm:p-3">
            {channels.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActiveKey(c.key)}
                aria-label={`Play ${c.source}`}
                className={`group relative flex-shrink-0 overflow-hidden rounded-lg border transition-all ${
                  active?.key === c.key
                    ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
                    : "border-[var(--border)] opacity-80 hover:opacity-100"
                }`}
                style={{ width: 116 }}
              >
                <div className="relative aspect-video w-full bg-gradient-to-br from-[#0b1f3a] to-black">
                  {c.thumb ? (
                    <Image src={c.thumb} alt="" fill className="object-cover" unoptimized sizes="116px" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="font-display text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">TV</span>
                    </div>
                  )}
                  {c.live && (
                    <span className="absolute top-1 left-1 flex items-center gap-1 rounded bg-[var(--danger)] px-1 py-0.5">
                      <span className="live-dot h-1 w-1 rounded-full bg-white" />
                      <span className="text-[7px] font-black uppercase tracking-wider text-white">Live</span>
                    </span>
                  )}
                  <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-black/70 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                    {c.source}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Clickable scrolling highlights */}
        {marquee.length > 0 && (
          <div className="flex items-stretch border-t border-[var(--border)] bg-black/40">
            <div className="flex flex-shrink-0 items-center bg-[var(--danger)] px-2.5 sm:px-3">
              <span className="text-[9px] font-black tracking-[0.18em] text-white uppercase sm:text-[10px]">Highlights</span>
            </div>
            <div className="hl-marquee relative flex-1 overflow-hidden">
              <div className="hl-track flex items-center whitespace-nowrap py-2.5">
                {marquee.map((item, i) => {
                  const href = newsHref(item);
                  const internal = isInternalHref(item);
                  const content = (
                    <span className="mx-5 inline-flex items-center gap-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]">
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
                      {item.title}
                      <span className="text-[10px] text-[var(--text-muted)]">· {item.source} · {timeAgo(item.publishedAt)}</span>
                    </span>
                  );
                  return internal ? (
                    <Link key={`${i}-${item.id}`} href={href} className="cursor-pointer">{content}</Link>
                  ) : (
                    <a key={`${i}-${item.id}`} href={href} target="_blank" rel="noopener noreferrer" className="cursor-pointer">{content}</a>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
