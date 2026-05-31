"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { useSearch } from "@/context/SearchContext";
import { useUser } from "@/context/UserContext";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { openSearch } = useSearch();
  const { currentUser, openAuth, logout } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
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

          {currentUser && currentUser.username ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-black/30 px-3 py-2 transition-all hover:border-[var(--gold)] hover:glow-border"
              >
                <span className="h-5 w-5 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/40 text-[9px] text-[var(--gold)] flex items-center justify-center font-bold font-display uppercase">
                  {currentUser.username.substring(0, 2)}
                </span>
                <span className="hidden text-[11px] font-bold text-[var(--text-primary)] sm:inline truncate max-w-[80px]">
                  {currentUser.username}
                </span>
              </button>
              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl glass-strong border border-[var(--border)] p-2 shadow-2xl z-50 animate-fade-in">
                    <div className="px-3 py-1.5 border-b border-[var(--border)] mb-1">
                      <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Account</p>
                      <p className="text-xs font-semibold truncate text-[var(--gold)]">{currentUser.username}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left rounded-lg px-3 py-2 text-xs font-bold text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-2 transition-all hover:border-[var(--gold)] hover:bg-[var(--gold)]/20 text-xs font-bold text-[var(--gold-bright)]"
            >
              <span className="font-display text-[9px]">◇</span>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
