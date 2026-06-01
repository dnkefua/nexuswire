"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/types";
import { NewsCard } from "./NewsCard";
import { Ticker } from "./Ticker";
import Link from "next/link";

const CATEGORIES = ["All", "Top Stories", "Politics", "Business", "Markets", "Technology", "Startups", "Fintech", "Sports", "Health", "Energy", "Security", "Entertainment", "Francophone Africa", "Video News"];
const SOURCE_TYPES = [
  { label: "All Types", value: "" },
  { label: "RSS", value: "rss" },
  { label: "Blogs", value: "blog" },
  { label: "YouTube", value: "youtube" },
];

export function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [category, setCategory] = useState("All");
  const [filterType, setFilterType] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [broaden, setBroaden] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ limit: "40" });
        if (category !== "All") params.set("category", category);
        if (filterType) params.set("type", filterType);
        const res = await fetch(`/api/news?${params}`);
        const data = await res.json() as { items?: NewsItem[]; error?: string };
        if (!res.ok) throw new Error(data.error || "Failed to load");
        if (!ignore) {
          // When "Broaden my view" is active, shuffle by region
          const all = data.items || [];
          setItems(broaden ? broadenFeed(all) : all);
          setLastUpdated(new Date());
        }
      } catch (e) {
        if (!ignore) {
          setError(e instanceof Error ? e.message : "Could not load feeds");
          setItems([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();
    return () => { ignore = true; };
  }, [category, filterType, broaden]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "40" });
      if (category !== "All") params.set("category", category);
      if (filterType) params.set("type", filterType);
      const res = await fetch(`/api/news?${params}`);
      const data = await res.json() as { items?: NewsItem[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load");
      const all = data.items || [];
      setItems(broaden ? broadenFeed(all) : all);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load feeds");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const featured = items[0];
  const rest = items.slice(1);

  return (
    <>
      <Ticker items={items} />

      <section className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold tracking-wide uppercase glow-text">
              <span className="brand-nexus">Global </span>
              <span className="brand-wire">Wire</span>
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Source-attributed previews from RSS, blogs &amp; YouTube
            </p>
            {lastUpdated && (
              <p className="text-[10px] text-[var(--text-muted)]/60 mt-0.5">
                Updated {lastUpdated.toLocaleTimeString()} · {items.length} stories
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() => setBroaden((v) => !v)}
              className={`chip cursor-pointer transition-all ${broaden ? "chip-blog" : ""}`}
              title="Diversify feed by region and source"
            >
              🌍 Broaden my view
            </button>
            <button type="button" onClick={refresh} className="btn-ghost">
              ↻ Refresh
            </button>
            <Link href="/search" className="btn-ghost text-xs">
              ⌕ Search
            </Link>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-4 flex gap-2 overflow-x-auto scroll-hide pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-[11px] font-bold tracking-wider uppercase transition-all ${
                category === cat
                  ? "bg-[var(--accent)] text-[#030508]"
                  : "glass text-[var(--text-muted)] hover:text-[var(--accent)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {SOURCE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setFilterType(t.value)}
              className={`chip cursor-pointer transition-all ${
                filterType === t.value ? "chip-rss" : ""
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 animate-pulse rounded-2xl glass"
                style={{ animationDelay: `${n * 100}ms` }}
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-2xl glass p-8 text-center">
            <p className="text-[var(--danger)]">{error}</p>
            <button type="button" onClick={refresh} className="btn-primary mt-4">
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl glass p-12 text-center text-[var(--text-muted)]">
            No stories in this category. Try another filter.
          </div>
        )}

        {/* Feed grid */}
        {!loading && !error && items.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured && (
              <div className="md:col-span-2 lg:col-span-3">
                <NewsCard item={featured} featured index={0} />
              </div>
            )}
            {rest.map((item, i) => (
              <NewsCard key={item.id} item={item} index={i + 1} />
            ))}
          </div>
        )}

        {/* Trust footer */}
        {!loading && items.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-4 justify-center text-[10px] text-[var(--text-muted)]/60 text-center">
            <Link href="/editorial-policy" className="hover:text-[var(--accent)] transition-colors">Editorial Policy</Link>
            <Link href="/source-policy" className="hover:text-[var(--accent)] transition-colors">Source Policy</Link>
            <Link href="/corrections" className="hover:text-[var(--accent)] transition-colors">Corrections</Link>
            <Link href="/dmca" className="hover:text-[var(--accent)] transition-colors">DMCA</Link>
            <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">Privacy</Link>
            <Link href="/about" className="hover:text-[var(--accent)] transition-colors">About</Link>
          </div>
        )}
      </section>
    </>
  );
}

/** Interleave items by region for feed diversity */
function broadenFeed(items: NewsItem[]): NewsItem[] {
  const byRegion: Record<string, NewsItem[]> = {};
  for (const item of items) {
    const r = item.region || "Global";
    if (!byRegion[r]) byRegion[r] = [];
    byRegion[r].push(item);
  }
  const regions = Object.keys(byRegion);
  const result: NewsItem[] = [];
  let i = 0;
  while (result.length < items.length) {
    const region = regions[i % regions.length];
    const item = byRegion[region]?.shift();
    if (item) result.push(item);
    i++;
    if (regions.every((r) => (byRegion[r]?.length ?? 0) === 0)) break;
  }
  return result;
}
