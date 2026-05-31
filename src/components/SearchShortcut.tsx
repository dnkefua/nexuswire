"use client";

import { useEffect } from "react";
import { useSearch } from "@/context/SearchContext";

/** Registers global Ctrl/Cmd+K to open search from any page. */
export function SearchShortcut() {
  const { openSearch, isOpen } = useSearch();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch, isOpen]);

  return null;
}
