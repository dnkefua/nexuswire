"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/types";
import { NewsCard } from "./NewsCard";

interface Props {
  /** Query string params appended to /api/news (e.g. "country=Nigeria"). */
  query: string;
  emptyText?: string;
}

export function FilteredFeed({ query, emptyText = "No stories found yet." }: Props) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/news?${query}&limit=40`)
      .then((r) => r.json())
      .then((d: { items?: NewsItem[]; error?: string }) => {
        if (ignore) return;
        if (d.error) setError(d.error);
        else setItems(d.items || []);
      })
      .catch(() => !ignore && setError("Could not load stories"))
      .finally(() => !ignore && setLoading(false));
    return () => { ignore = true; };
  }, [query]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-56 animate-pulse rounded-2xl glass" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="rounded-2xl glass p-8 text-center text-[var(--danger)]">{error}</div>;
  }

  if (items.length === 0) {
    return <div className="rounded-2xl glass p-12 text-center text-[var(--text-muted)]">{emptyText}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <NewsCard key={item.id} item={item} index={i} />
      ))}
    </div>
  );
}
