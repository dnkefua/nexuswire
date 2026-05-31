"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { useSearch } from "@/context/SearchContext";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { openSearch } = useSearch();
  const isHome = !title || title === "NexusWire";

  return (
    <header className="sticky top-0 z-40 glass border-b border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        {isHome ? (
          <BrandLogo variant="icon" href="/" />
        ) : (
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo variant="icon" href="/" />
            <div className="min-w-0">
              <h1 className="truncate font-display text-sm font-bold tracking-[0.15em] text-[var(--text-primary)] uppercase">
                {title}
              </h1>
              <p className="truncate text-[10px] tracking-widest text-[var(--gold)] uppercase opacity-90">
                {subtitle || "Premium News Network"}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={openSearch}
            className="search-trigger flex items-center gap-2 rounded-xl border border-[var(--border)] bg-black/30 px-3 py-2 transition-all hover:border-[var(--accent)] hover:glow-border"
            aria-label="Search news"
          >
            <span className="font-display text-base text-[var(--accent)]">⌕</span>
            <span className="hidden text-[11px] font-semibold text-[var(--text-muted)] sm:inline">
              Search
            </span>
            <kbd className="hidden rounded border border-[var(--border)] px-1.5 py-0.5 text-[9px] text-[var(--text-muted)] md:inline">
              ⌘K
            </kbd>
          </button>
          <span className="live-dot hidden h-2 w-2 rounded-full sm:block" />
        </div>
      </div>
    </header>
  );
}
