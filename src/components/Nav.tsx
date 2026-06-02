"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSearch } from "@/context/SearchContext";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Wire", icon: "◈" },
  { href: "/live", label: "Live", icon: "◎" },
  { href: "/movies", label: "Movies", icon: "▶" },
  { href: "__search__", label: "Search", icon: "⌕" },
  { href: "/saved", label: "Saved", icon: "☆" },
  { href: "/journalists", label: "Desk", icon: "◇" },
  { href: "/studio", label: "Studio", icon: "▣" },
];

export function Nav() {
  const pathname = usePathname();
  const { openSearch, isOpen } = useSearch();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-7xl items-center justify-around px-1 py-2">
        {links.map((link) => {
          if (link.href === "__search__") {
            return (
              <button
                key="search"
                type="button"
                onClick={openSearch}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2 transition-colors",
                  isOpen ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                )}
              >
                <span className={cn("font-display text-base leading-none", isOpen && "glow-text")}>
                  {link.icon}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest sm:text-[9px]">
                  {link.label}
                </span>
              </button>
            );
          }

          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2 transition-colors",
                active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
              )}
            >
              <span className={cn("font-display text-base leading-none", active && "glow-text")}>
                {link.icon}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest sm:text-[9px]">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
