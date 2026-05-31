"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/types";
import { NewsCard } from "./NewsCard";
import { Ticker } from "./Ticker";

const CATEGORIES = ["All", "World", "Technology", "Business", "Live"];

export function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [category, setCategory] = useState("All");
  const [filterType, setFilterType] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        if (!ignore) setItems(data.items || []);
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
    return () => {
      ignore = true;
    };
  }, [category, filterType]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "40" });
      if (category !== "All") params.set("category", category);
      if (filterType) params.set("type", filterType);
      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setItems(data.items || []);
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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold tracking-wide uppercase glow-text">
              <span className="brand-nexus">Global </span>
              <span className="brand-wire">Wire</span>
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Aggregated from RSS, blogs & YouTube — refreshed live
            </p>
          </div>
            <button type="button" onClick={refresh} className="btn-ghost w-fit">
            ↻ Refresh
          </button>
        </div>

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

        <div className="mb-6 flex gap-2">
          {[
            { label: "All Types", value: "" },
            { label: "RSS", value: "rss" },
            { label: "Blogs", value: "blog" },
            { label: "YouTube", value: "youtube" },
          ].map((t) => (
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

        {error && !loading && (
          <div className="rounded-2xl glass p-8 text-center">
            <p className="text-[var(--danger)]">{error}</p>
            <button type="button" onClick={refresh} className="btn-primary mt-4">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl glass p-12 text-center text-[var(--text-muted)]">
            No stories in this category. Try another filter.
          </div>
        )}

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
      </section>
    </>
  );
}
