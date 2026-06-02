"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearch } from "@/context/SearchContext";
import { SEARCH_FACETS } from "@/lib/search";
import type { NewsItem, SearchFacet } from "@/lib/types";
import { timeAgo, cn } from "@/lib/utils";

const COUNTRIES = [
  "All",
  "United States",
  "United Kingdom",
  "France",
  "Germany",
  "Qatar",
];

function typeChip(type: NewsItem["sourceType"]) {
  if (type === "youtube") return "chip-youtube";
  if (type === "blog") return "chip-blog";
  return "chip-rss";
}

export function GlobalSearch() {
  const { isOpen, closeSearch } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [facet, setFacet] = useState<SearchFacet>("all");
  const [country, setCountry] = useState("All");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "40", facet });
      if (query.trim()) params.set("q", query.trim());
      if (country !== "All") params.set("country", country);
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setItems(data.items || []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query, facet, country]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const t = window.setTimeout(() => {
      void runSearch();
    }, 300);
    return () => window.clearTimeout(t);
  }, [isOpen, query, facet, country, runSearch]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        closeSearch();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeSearch]);

  if (!isOpen) return null;

  const showCountries = facet === "countries" || facet === "all";

  return (
    <div
      className="search-overlay fixed inset-0 z-[100] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Global news search"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close search"
        onClick={closeSearch}
      />

      <div className="relative mx-auto mt-4 flex w-full max-w-3xl flex-col px-4 pb-8 md:mt-12">
        <div className="search-panel glass-strong glow-border overflow-hidden rounded-2xl">
          <div className="flex items-center gap-3 border-b border-[var(--border)] p-4">
            <span className="font-display text-[var(--accent)] text-lg">⌕</span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search headlines, sources, countries…"
              className="flex-1 border-0 bg-transparent p-0 text-base shadow-none focus:ring-0"
              autoComplete="off"
            />
            <kbd className="hidden rounded border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--text-muted)] sm:inline">
              Esc
            </kbd>
            <button
              type="button"
              onClick={closeSearch}
              className="btn-ghost py-2 px-3 text-[10px]"
            >
              Close
            </button>
          </div>

          <div className="border-b border-[var(--border)] p-3">
            <p className="mb-2 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {SEARCH_FACETS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  title={f.description}
                  onClick={() => {
                    setFacet(f.id);
                    if (f.id !== "countries") setCountry("All");
                  }}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase transition-all",
                    facet === f.id
                      ? "bg-[var(--accent)] text-[#030508]"
                      : "glass text-[var(--text-muted)] hover:text-[var(--accent)]"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {showCountries && (
            <div className="border-b border-[var(--border)] p-3">
              <p className="mb-2 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
                Country / Region
              </p>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCountry(c)}
                    className={cn(
                      "chip cursor-pointer transition-all",
                      country === c ? "chip-rss" : ""
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-h-[min(55vh,480px)] overflow-y-auto scroll-hide p-3">
            {loading && (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-16 animate-pulse rounded-xl glass" />
                ))}
              </div>
            )}

            {error && !loading && (
              <p className="p-6 text-center text-sm text-[var(--danger)]">{error}</p>
            )}

            {!loading && !error && items.length === 0 && (
              <p className="p-8 text-center text-sm text-[var(--text-muted)]">
                No results. Try another keyword or category.
              </p>
            )}

            {!loading && !error && items.length > 0 && (
              <>
                <p className="mb-3 px-1 text-[11px] text-[var(--text-muted)]">
                  {total} result{total !== 1 ? "s" : ""}
                  {query ? ` for “${query}”` : ""}
                </p>
                <ul className="space-y-2">
                  {items.map((item) => {
                    const isVideo = item.sourceType === "youtube";
                    const isBlogOrRss = item.sourceType === "blog" || item.sourceType === "rss";

                    let href = item.link;
                    let target: string | undefined = "_blank";
                    let rel: string | undefined = "noopener noreferrer";

                    if (isVideo) {
                      href = `/live?v=${item.videoId}&title=${encodeURIComponent(item.title)}&source=${encodeURIComponent(item.source)}&summary=${encodeURIComponent(item.summary || "")}`;
                      target = undefined;
                      rel = undefined;
                    } else if (isBlogOrRss) {
                      href = `/read?id=${item.id}&title=${encodeURIComponent(item.title)}&summary=${encodeURIComponent(item.summary || "")}&image=${encodeURIComponent(item.image || "")}&source=${encodeURIComponent(item.source)}&link=${encodeURIComponent(item.link)}&publishedAt=${encodeURIComponent(item.publishedAt)}&sourceType=${encodeURIComponent(item.sourceType)}&category=${encodeURIComponent(item.category)}&region=${encodeURIComponent(item.region || "")}&country=${encodeURIComponent(item.country || "")}`;
                      target = undefined;
                      rel = undefined;
                    }

                    return (
                      <li key={item.id}>
                        <a
                          href={href}
                          target={target}
                          rel={rel}
                          onClick={closeSearch}
                          className="flex gap-3 rounded-xl p-3 transition-all glass hover:glow-border"
                        >
                          {item.image && (
                            <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                              <Image
                                src={item.image}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="80px"
                                quality={58}
                                unoptimized={item.image.startsWith("http")}
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap gap-1.5">
                              <span className={cn("chip tag-sm", typeChip(item.sourceType))}>
                                {item.sourceType === "rss"
                                  ? "Newspaper"
                                  : item.sourceType}
                              </span>
                              <span className="chip">{item.country}</span>
                            </div>
                            <p className="line-clamp-2 text-sm font-semibold text-[var(--text-primary)]">
                              {item.title}
                            </p>
                            <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                              {item.source} · {timeAgo(item.publishedAt)}
                            </p>
                          </div>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] text-[var(--text-muted)]">
          Press{" "}
          <kbd className="rounded border border-[var(--border)] px-1.5">Ctrl</kbd>+
          <kbd className="rounded border border-[var(--border)] px-1.5">K</kbd> anywhere
          to open search
        </p>
      </div>
    </div>
  );
}
