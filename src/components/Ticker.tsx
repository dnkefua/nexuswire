"use client";

import Link from "next/link";
import type { NewsItem } from "@/lib/types";
import { newsHref, isInternalHref } from "@/lib/item-link";

interface TickerProps {
  items: NewsItem[];
}

export function Ticker({ items }: TickerProps) {
  const headlines = items.slice(0, 10);

  if (headlines.length === 0) {
    return (
      <div className="flex h-9 items-stretch overflow-hidden border-y border-[var(--border)] bg-black/50">
        <div className="flex flex-shrink-0 items-center bg-[var(--danger)] px-3">
          <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase">Breaking</span>
        </div>
        <div className="flex items-center px-4 text-xs text-[var(--text-muted)]">
          Aggregating global wire feeds…
        </div>
      </div>
    );
  }

  const doubled = [...headlines, ...headlines];

  return (
    <div className="flex h-9 items-stretch overflow-hidden border-y border-[var(--border)] bg-black/50">
      <div className="flex flex-shrink-0 items-center bg-[var(--danger)] px-3">
        <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase">Breaking</span>
      </div>
      <div className="hl-marquee relative flex-1 overflow-hidden">
        <div className="ticker-track absolute flex whitespace-nowrap py-2.5">
          {doubled.map((item, i) => {
            const href = newsHref(item);
            const cls = "mx-8 text-xs font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--accent)] cursor-pointer";
            return isInternalHref(item) ? (
              <Link key={`${i}-${item.id}`} href={href} className={cls}>
                {item.title}
              </Link>
            ) : (
              <a key={`${i}-${item.id}`} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                {item.title}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
