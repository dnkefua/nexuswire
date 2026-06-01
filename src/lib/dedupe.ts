import type { NewsItem } from "./types";

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    u.searchParams.delete("utm_content");
    u.searchParams.delete("utm_term");
    return u.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}

export function createArticleId(sourceId: string, url: string): string {
  const normalized = normalizeUrl(url);
  // Simple hash-like ID
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return `${sourceId}-${Math.abs(hash).toString(36)}`;
}

/** Returns true if two articles are likely the same story */
export function isLikelyDuplicate(a: NewsItem, b: NewsItem): boolean {
  if (a.id === b.id) return true;
  if (normalizeUrl(a.link) === normalizeUrl(b.link)) return true;
  const titleA = normalizeTitle(a.title);
  const titleB = normalizeTitle(b.title);
  if (titleA === titleB) return true;
  // Levenshtein distance ratio approximation for near-duplicate titles
  if (titleA.length > 20 && titleB.length > 20) {
    const longer = titleA.length > titleB.length ? titleA : titleB;
    const shorter = titleA.length > titleB.length ? titleB : titleA;
    if (longer.includes(shorter.slice(0, Math.floor(shorter.length * 0.8)))) {
      return true;
    }
  }
  return false;
}

export function deduplicateItems(items: NewsItem[]): NewsItem[] {
  const seen: NewsItem[] = [];
  for (const item of items) {
    if (!seen.some((s) => isLikelyDuplicate(s, item))) {
      seen.push(item);
    }
  }
  return seen;
}
