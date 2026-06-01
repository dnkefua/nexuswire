"use client";

import Link from "next/link";
import { COUNTRIES, PRIMARY_CATEGORIES, categoryToSlug } from "@/lib/taxonomy";

export function CountryStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-4 space-y-4">
      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Link href="/briefing" className="chip chip-rss cursor-pointer">📰 Daily Briefing</Link>
        <Link href="/trending" className="chip chip-blog cursor-pointer">🔥 Trending Clusters</Link>
        <Link href="/live" className="chip chip-youtube cursor-pointer">▶ Video News</Link>
      </div>

      {/* Country selector */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Countries</p>
        <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
          {COUNTRIES.map((c) => (
            <Link
              key={c.slug}
              href={`/country/${c.slug}`}
              className="flex-shrink-0 rounded-full glass px-3 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] hover:glow-border transition-all whitespace-nowrap"
            >
              {c.flag} {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Topic selector */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Topics</p>
        <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
          {PRIMARY_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/topic/${categoryToSlug(cat)}`}
              className="flex-shrink-0 rounded-full glass px-3 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] hover:glow-border transition-all whitespace-nowrap"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
