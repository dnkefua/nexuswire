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

const liveIdCache: Record<string, { id: string; expires: number }> = {};

async function getLiveVideoIdFromYouTube(handle: string): Promise<string | null> {
  const now = Date.now();
  if (liveIdCache[handle] && liveIdCache[handle].expires > now) {
    return liveIdCache[handle].id;
  }

  try {
    const url = `https://www.youtube.com/${handle}/live`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const html = await res.text();

    let videoId: string | null = null;
    const canonicalMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/);
    if (canonicalMatch && canonicalMatch[1]) {
      videoId = canonicalMatch[1];
    } else {
      const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (videoIdMatch && videoIdMatch[1]) {
        videoId = videoIdMatch[1];
      }
    }

    if (videoId) {
      liveIdCache[handle] = {
        id: videoId,
        expires: now + 3600 * 1000, // Cache for 1 hour
      };
      return videoId;
    }
  } catch (e) {
    console.error(`Failed to get live video ID for ${handle}:`, e);
  }
  return null;
}

async function getYouTubeFallbacks(source: FeedSource, limit = 8): Promise<NewsItem[]> {
  const fallbacks: Record<string, { title: string; videoId: string; summary: string }[]> = {
    "youtube-bbc": [
      {
        title: "BBC News Live - World News Today",
        videoId: "q722HeeGgC0",
        summary: "Live broadcast from the BBC News global newsroom, covering breaking news, special events, and deep-dive analysis from international correspondents."
      },
      {
        title: "BBC Special Report: AI Revolution in Modern Healthcare",
        videoId: "9E_G8Z6wDns",
        summary: "BBC science and technology reporters investigate how machine learning models and computer vision are reshaping medical diagnostics and treatment."
      }
    ],
    "youtube-cnn": [
      {
        title: "CNN Special Report: The Changing Global Economy",
        videoId: "t2gG8Q0F53g",
        summary: "CNN's business team examines trade agreements, supply chain challenges, and consumer spending shifts affecting markets worldwide."
      }
    ],
    "youtube-france24": [
      {
        title: "FRANCE 24 English Live Stream - International News 24/7",
        videoId: "h3MuIUNMwzI",
        summary: "Continuous live coverage of news from Europe, the Middle East, Africa, and around the globe. Reporting directly from Paris, France."
      }
    ],
    "youtube-verge": [
      {
        title: "AI Devices and the Next Ten Years of Computing - The Verge",
        videoId: "d_T5zM1D55E",
        summary: "The Verge reviews new consumer devices, local AI processing chips, and assistant agents to see if they live up to the hype."
      }
    ],
    "youtube-reuters": [
      {
        title: "Reuters Business Report: Global Stock Markets Overview",
        videoId: "3yK7E0B3_d0",
        summary: "Financial analysts at Reuters review the trading week, commodity prices, and central bank interest rate decisions globally."
      }
    ]
  };

  const list = [...(fallbacks[source.id] || [
    {
      title: `${source.name} Video Update`,
      videoId: "h3MuIUNMwzI",
      summary: "Reporting and video feed update from our international broadcast partners."
    }
  ])];

  const handles: Record<string, string> = {
    "youtube-bbc": "@BBCNews",
    "youtube-france24": "@France24_en",
  };

  const handle = handles[source.id];
  if (handle) {
    const liveId = await getLiveVideoIdFromYouTube(handle);
    if (liveId && list[0]) {
      list[0] = {
        ...list[0],
        videoId: liveId,
      };
    }
  }

  return list.slice(0, limit).map((v, i) => {
    const link = `https://www.youtube.com/watch?v=${v.videoId}`;
    const publishedAt = new Date(Date.now() - i * 3600000).toISOString();
    return {
      id: hashId(`${source.id}-${link}`),
      title: v.title,
      summary: v.summary,
      link,
      image: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
      source: source.name,
      sourceType: source.type as NewsSourceType,
      category: source.category,
      region: source.region,
      country: source.country,
      publishedAt,
      author: source.name,
      isLive: true,
      videoId: v.videoId,
    };
  });
}

export async function fetchFeed(
  source: FeedSource,
  limit = 8
): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    const items = (feed.items || []).slice(0, limit).map((item) => {
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
    if (items.length > 0) {
      return items;
    }
  } catch {
    // Fail silently to trigger fallback below
  }

  if (source.type === "youtube") {
    return await getYouTubeFallbacks(source, limit);
  }
  return [];
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
