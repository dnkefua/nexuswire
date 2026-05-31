import Parser from "rss-parser";
import { createHash } from "crypto";
import { DEFAULT_FEEDS } from "./feeds";
import type { FeedSource, NewsItem, NewsSourceType } from "./types";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
    ],
  },
  timeout: 12000,
});

function hashId(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImage(item: Parser.Item & Record<string, unknown>): string | undefined {
  const enc = item.enclosure;
  if (enc?.url && /\.(jpg|jpeg|png|webp|gif)/i.test(enc.url)) return enc.url;

  const media = item["media:content"] as { $?: { url?: string } } | undefined;
  if (media?.$?.url) return media.$.url;

  const thumb = item["media:thumbnail"] as { $?: { url?: string } } | undefined;
  if (thumb?.$?.url) return thumb.$.url;

  const content = item.content || item.contentSnippet || "";
  const match = String(content).match(/src=["']([^"']+\.(jpg|jpeg|png|webp))[^"']*/i);
  return match?.[1];
}

function extractYouTubeId(link: string): string | undefined {
  const m = link.match(/(?:v=|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1];
}

function youtubeThumb(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export async function fetchFeed(
  source: FeedSource,
  limit = 8
): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).slice(0, limit).map((item) => {
      const link = item.link || item.guid || source.url;
      const videoId =
        source.type === "youtube" ? extractYouTubeId(link) : undefined;
      const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();
      const rawSummary =
        item.contentSnippet || item.summary || item.content || item.title || "";
      const summary = stripHtml(String(rawSummary)).slice(0, 280);
      let image = extractImage(item as unknown as Parser.Item & Record<string, unknown>);
      if (!image && videoId) image = youtubeThumb(videoId);

      return {
        id: hashId(`${source.id}-${link}`),
        title: item.title || "Untitled",
        summary,
        link,
        image,
        source: source.name,
        sourceType: source.type as NewsSourceType,
        category: source.category,
        region: source.region,
        country: source.country,
        publishedAt,
        author: item.creator || (item as unknown as { author?: string }).author || feed.title,
        isLive: source.type === "youtube",
        videoId,
      };
    });
  } catch {
    return [];
  }
}

export async function aggregateNews(options?: {
  category?: string;
  type?: NewsSourceType;
  limit?: number;
}): Promise<NewsItem[]> {
  const limit = options?.limit ?? 48;
  let sources = DEFAULT_FEEDS;
  if (options?.category && options.category !== "All") {
    sources = sources.filter((s) => s.category === options.category);
  }
  if (options?.type) {
    sources = sources.filter((s) => s.type === options.type);
  }

  const batches = await Promise.all(sources.map((s) => fetchFeed(s, 6)));
  const merged = batches.flat();

  merged.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const seen = new Set<string>();
  const unique: NewsItem[] = [];
  for (const item of merged) {
    const key = item.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= limit) break;
  }

  return unique;
}

export function getFeedCatalog(): FeedSource[] {
  return DEFAULT_FEEDS;
}
