"use client";

import type { NewsItem } from "@/lib/types";

interface TickerProps {
  items: NewsItem[];
}

export function Ticker({ items }: TickerProps) {
  const headlines =
    items.length > 0
      ? items.slice(0, 8).map((i) => i.title)
      : [
          "Aggregating global wire feeds…",
          "YouTube live channels syncing…",
          "Journalist studio ready for broadcast scheduling",
        ];

  const doubled = [...headlines, ...headlines];

  return (
    <div className="flex h-9 items-stretch overflow-hidden border-y border-[var(--border)] bg-black/50">
      <div className="flex flex-shrink-0 items-center bg-[var(--danger)] px-3">
        <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase">
          Breaking
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="ticker-track absolute flex whitespace-nowrap py-2.5">
          {doubled.map((text, i) => (
            <span
              key={`${i}-${text.slice(0, 20)}`}
              className="mx-8 text-xs font-medium text-[var(--text-primary)]"
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
