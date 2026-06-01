"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import type { NewsItem } from "@/lib/types";

const CATEGORIES = ["All", "World", "Technology", "Business", "Live", "Africa", "Cameroon"];
const SOURCE_TYPES = [
  { label: "All Types", value: "" },
  { label: "RSS", value: "rss" },
  { label: "Blogs", value: "blog" },
  { label: "YouTube", value: "youtube" },
];

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [sourceType, setSourceType] = useState(params.get("type") || "");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (q: string, cat: string, type: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const p = new URLSearchParams({ limit: "40" });
      if (q) p.set("q", q);
      if (cat && cat !== "All") p.set("category", cat);
      if (type) p.set("type", type);
      const res = await fetch(`/api/news?${p}`);
      const data = await res.json() as { items?: NewsItem[] };
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto search when filters change
  useEffect(() => {
    if (searched || params.get("q")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void search(query, category, sourceType);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sourceType]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (category !== "All") p.set("category", category);
    if (sourceType) p.set("type", sourceType);
    router.replace(`/search?${p}`);
    void search(query, category, sourceType);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <form onSubmit={handleSubmit} className="rounded-2xl glass-strong p-6 space-y-4 fade-up">
        <div className="flex gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news, topics, publishers..."
            className="flex-1"
            autoFocus
          />
          <button type="submit" className="btn-primary px-6 whitespace-nowrap">
            Search
          </button>
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`chip cursor-pointer transition-all ${category === c ? "chip-rss" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Source Type</p>
          <div className="flex flex-wrap gap-2">
            {SOURCE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSourceType(t.value)}
                className={`chip cursor-pointer transition-all ${sourceType === t.value ? "chip-blog" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </form>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-56 animate-pulse rounded-2xl glass" />
          ))}
        </div>
      )}

      {!loading && searched && items.length === 0 && (
        <div className="rounded-2xl glass p-12 text-center text-[var(--text-muted)]">
          No results found. Try adjusting your search or filters.
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-widest">
            {items.length} results
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <NewsCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </>
      )}

      {!searched && (
        <div className="rounded-2xl glass p-12 text-center text-[var(--text-muted)]">
          <p className="text-2xl mb-3">⌕</p>
          <p>Enter a query or select filters to search news.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main>
      <Header title="Search" subtitle="Find News Across Sources" />
      <Suspense fallback={<div className="h-64 animate-pulse mx-auto max-w-5xl px-4 py-6 rounded-2xl glass" />}>
        <SearchContent />
      </Suspense>
    </main>
  );
}
