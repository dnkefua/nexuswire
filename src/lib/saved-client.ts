"use client";

import { useState, useEffect, useCallback } from "react";

export interface SavedArticle {
  id: string;
  title: string;
  summary?: string;
  link: string;
  source: string;
  image?: string;
  publishedAt: string;
  sourceType: string;
  category: string;
  savedAt: string;
}

const KEY = "nexuswire:saved";

function readStorage(): SavedArticle[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as SavedArticle[];
  } catch {
    return [];
  }
}

function writeStorage(items: SavedArticle[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function useSaved() {
  const [saved, setSaved] = useState<SavedArticle[]>([]);

  useEffect(() => {
    // Hydrate from localStorage after mount (avoids SSR mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(readStorage());
  }, []);

  const isSaved = useCallback((id: string) => saved.some((s) => s.id === id), [saved]);

  const save = useCallback((article: Omit<SavedArticle, "savedAt">) => {
    setSaved((prev) => {
      if (prev.some((s) => s.id === article.id)) return prev;
      const next = [{ ...article, savedAt: new Date().toISOString() }, ...prev];
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.filter((s) => s.id !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  return { saved, isSaved, save, remove };
}
