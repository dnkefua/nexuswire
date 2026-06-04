import type { NewsItem } from "./types";

/**
 * Resolves the correct destination for a news item:
 *  - YouTube videos → the in-app Live Hub player (/live?v=…)
 *  - RSS / blog articles → the in-app source-attributed reader (/read?…)
 *  - anything else → the original external link
 *
 * Shared by NewsCard, the highlights ticker, and the landing TV player so a
 * click always lands on the same place.
 */
export function newsHref(item: NewsItem): string {
  const isVideo = item.sourceType === "youtube";
  const isBlogOrRss = item.sourceType === "blog" || item.sourceType === "rss";

  if (isVideo) {
    const params = new URLSearchParams({
      title: item.title,
      source: item.source,
      summary: item.summary || "",
    });
    if (item.videoId) params.set("v", item.videoId);
    if (item.playlistId) params.set("playlist", item.playlistId);
    return `/live?${params}`;
  }

  if (isBlogOrRss) {
    const params = new URLSearchParams({
      id: item.id,
      title: item.title,
      summary: item.summary || "",
      image: item.image || "",
      source: item.source,
      link: item.link,
      publishedAt: item.publishedAt,
      sourceType: item.sourceType,
      category: item.category,
      region: item.region || "",
      country: item.country || "",
    });
    return `/read?${params}`;
  }

  return item.link;
}

/** Whether the link is internal (in-app SPA route) vs an external publisher URL. */
export function isInternalHref(item: NewsItem): boolean {
  return newsHref(item).startsWith("/");
}
