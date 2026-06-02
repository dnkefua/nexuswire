import Parser from "rss-parser";
import { createHash } from "crypto";
import { DEFAULT_FEEDS } from "./feeds";
import { isLikelyDuplicate } from "./dedupe";
import { matchesCategory } from "./taxonomy";
import type { FeedSource, NewsItem, NewsSourceType, SourceHealth } from "./types";

/** In-memory cache for aggregated feed results (per server instance). */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cache: { items: NewsItem[]; expires: number } | null = null;

/** In-memory source health tracking (per server instance). */
const sourceHealth: Record<string, SourceHealth> = {};

export function getSourceHealth(): SourceHealth[] {
  return DEFAULT_FEEDS.map((s) => {
    const base: SourceHealth = {
      id: s.id,
      name: s.name,
      url: s.url,
      type: s.type,
      category: s.category,
      region: s.region,
      country: s.country,
      active: true,
      trusted: true,
    };
    return { ...base, ...sourceHealth[s.id] };
  });
}

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
    ],
  },
  timeout: 12000,
  headers: {
    // A realistic UA materially improves success rates (esp. YouTube RSS).
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

/** Run async tasks with bounded concurrency to avoid source-side throttling. */
async function pooledMap<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/** Fetch configured feeds with bounded concurrency. */
export async function fetchAllFeeds(perFeed = 8, sources: FeedSource[] = DEFAULT_FEEDS): Promise<NewsItem[]> {
  const batches = await pooledMap(sources, 6, (s) => fetchFeed(s, perFeed));
  return batches.flat();
}

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

function uploadsPlaylistId(channelId: string): string {
  return channelId.startsWith("UC") ? `UU${channelId.slice(2)}` : channelId;
}

function youtubeChannelFallback(source: FeedSource): NewsItem | null {
  if (!source.youtubeChannelId) return null;
  const playlistId = uploadsPlaylistId(source.youtubeChannelId);
  const link = source.homepageUrl || `https://www.youtube.com/channel/${source.youtubeChannelId}`;
  return {
    id: hashId(`${source.id}-${playlistId}`),
    title: `${source.name} latest uploads`,
    summary: `Official ${source.name} uploads playlist. Recent individual videos are shown first when YouTube RSS is available.`,
    link,
    source: source.name,
    sourceType: "youtube",
    category: source.category,
    region: source.region,
    country: source.country,
    publishedAt: new Date().toISOString(),
    author: source.name,
    isLive: true,
    playlistId,
    fallbackKind: "channel_playlist",
    credibilityScore: source.credibilityScore,
  };
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

/**
 * Demo-only YouTube fallbacks. These are guarded behind
 * NEXT_PUBLIC_ENABLE_DEMO_FALLBACKS and clearly labeled as demo content so they
 * are never presented as real, current news. If the flag is off, sources that
 * fail to load simply return no items (handled by the caller).
 */
async function getYouTubeFallbacks(source: FeedSource, limit = 8): Promise<NewsItem[]> {
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACKS !== "true") {
    const channel = youtubeChannelFallback(source);
    return channel ? [channel] : [];
  }
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

  return list.slice(0, limit).map((v) => {
    const link = `https://www.youtube.com/watch?v=${v.videoId}`;
    return {
      id: hashId(`${source.id}-${link}`),
      title: `[Demo] ${v.title}`,
      summary: `Demo fallback content — ${v.summary}`,
      link,
      image: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
      source: source.name,
      sourceType: source.type as NewsSourceType,
      category: source.category,
      region: source.region,
      country: source.country,
      publishedAt: new Date(0).toISOString(),
      author: source.name,
      isLive: false,
      videoId: v.videoId,
    };
  });
}

function recordHealth(source: FeedSource, patch: Partial<SourceHealth>) {
  const prev = sourceHealth[source.id] ?? {
    id: source.id,
    name: source.name,
    url: source.url,
    type: source.type,
    category: source.category,
    region: source.region,
    country: source.country,
    active: true,
    trusted: true,
    errorCount: 0,
  };
  sourceHealth[source.id] = { ...prev, ...patch };
}

export async function fetchFeed(
  source: FeedSource,
  limit = 8
): Promise<NewsItem[]> {
  const fetchedAt = new Date().toISOString();
  recordHealth(source, { lastFetchedAt: fetchedAt });
  try {
    let feed;
    try {
      feed = await parser.parseURL(source.url);
    } catch (err) {
      // YouTube RSS throttles bursts with 404/500 — back off briefly and retry once.
      if (source.type === "youtube" && /\b(404|500|429|503)\b/.test(String(err))) {
        await new Promise((r) => setTimeout(r, 800));
        feed = await parser.parseURL(source.url);
      } else {
        throw err;
      }
    }
    const items: NewsItem[] = (feed.items || []).slice(0, limit).map((item) => {
      const link = item.link || item.guid || source.url;
      const videoId =
        source.type === "youtube" ? extractYouTubeId(link) : undefined;
      const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();
      const rawSummary =
        item.contentSnippet || item.summary || item.content || item.title || "";
      const summary = stripHtml(String(rawSummary)).slice(0, 280);
      let image = extractImage(item as unknown as Parser.Item & Record<string, unknown>);
      if (!image && videoId) image = youtubeThumb(videoId);

      // Google News RSS encodes the publisher as a " - Publisher" title suffix.
      // Surface the real publisher instead of "Google News".
      let title = item.title || "Untitled";
      let publisherName = source.name;
      if (source.googleNews) {
        const m = title.match(/^(.*)\s[–-]\s([^–-]+)$/);
        if (m) {
          title = m[1].trim();
          publisherName = m[2].trim();
        }
      }

      return {
        id: hashId(`${source.id}-${link}`),
        title,
        summary,
        link,
        image,
        source: publisherName,
        sourceType: source.type as NewsSourceType,
        category: source.category,
        region: source.region,
        country: source.country,
        publishedAt,
        author: item.creator || (item as unknown as { author?: string }).author || feed.title,
        isLive: source.type === "youtube",
        videoId,
        playlistId: undefined,
        credibilityScore: source.credibilityScore,
        viaDiscovery: source.googleNews === true,
      };
    });
    const channelFallback = source.type === "youtube" ? youtubeChannelFallback(source) : null;
    if (channelFallback) items.push(channelFallback);
    if (items.length > 0) {
      recordHealth(source, {
        lastSuccessfulFetchAt: fetchedAt,
        articlesFetched: items.length,
        lastError: undefined,
      });
      return items;
    }
    recordHealth(source, { lastError: "Feed returned no items" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown fetch error";
    const prevCount = sourceHealth[source.id]?.errorCount ?? 0;
    recordHealth(source, { lastError: message, errorCount: prevCount + 1 });
    console.warn(`[rss] Source "${source.name}" (${source.id}) failed: ${message}`);
  }

  if (source.type === "youtube") {
    return await getYouTubeFallbacks(source, limit);
  }
  return [];
}

/** Fetch & cache the full aggregated feed (all sources). */
const scopedCache: Record<string, { items: NewsItem[]; expires: number }> = {};

function rankAndDedupe(items: NewsItem[]): NewsItem[] {
  const rankedAt = Date.now();
  function score(item: NewsItem): number {
    const ageHours = Math.max(0, (rankedAt - new Date(item.publishedAt).getTime()) / 3_600_000);
    const recency = Math.max(0, 100 - ageHours);
    const credibility = item.credibilityScore ?? 60;
    const discoveryPenalty = item.viaDiscovery ? 15 : 0;
    const playlistFallbackPenalty = item.fallbackKind === "channel_playlist" ? 90 : 0;
    return recency * 0.6 + credibility * 0.4 - discoveryPenalty - playlistFallbackPenalty;
  }

  items.sort((a, b) => score(b) - score(a));

  const unique: NewsItem[] = [];
  for (const item of items) {
    if (!unique.some((u) => isLikelyDuplicate(u, item))) {
      unique.push(item);
    }
  }

  return unique;
}

function publishedTime(item: NewsItem): number {
  const parsed = new Date(item.publishedAt).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortNewestFirst(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => {
    if (a.fallbackKind === "channel_playlist" && b.fallbackKind !== "channel_playlist") return 1;
    if (b.fallbackKind === "channel_playlist" && a.fallbackKind !== "channel_playlist") return -1;
    return publishedTime(b) - publishedTime(a);
  });
}

async function getAllNews(force = false): Promise<NewsItem[]> {
  const now = Date.now();
  if (!force && cache && cache.expires > now) {
    return cache.items;
  }

  const merged = await fetchAllFeeds(8);

  // Composite ranking: recency blended with source credibility so that trusted
  // publisher feeds are never automatically outranked by Google discovery items.
  const rankedAt = Date.now();
  function score(item: NewsItem): number {
    const ageHours = Math.max(0, (rankedAt - new Date(item.publishedAt).getTime()) / 3_600_000);
    const recency = Math.max(0, 100 - ageHours); // newer → higher
    const credibility = item.credibilityScore ?? 60;
    const discoveryPenalty = item.viaDiscovery ? 15 : 0;
    const playlistFallbackPenalty = item.fallbackKind === "channel_playlist" ? 90 : 0;
    return recency * 0.6 + credibility * 0.4 - discoveryPenalty - playlistFallbackPenalty;
  }
  merged.sort((a, b) => score(b) - score(a));

  // Deduplicate by canonical URL then normalized title. Because the list is
  // pre-sorted by credibility-weighted score, the kept copy is the most trusted.
  const unique: NewsItem[] = [];
  for (const item of merged) {
    if (!unique.some((u) => isLikelyDuplicate(u, item))) {
      unique.push(item);
    }
  }

  cache = { items: unique, expires: now + CACHE_TTL_MS };
  return unique;
}

async function getScopedNews(
  cacheKey: string,
  sources: FeedSource[],
  perFeed: number,
  force = false
): Promise<NewsItem[]> {
  const now = Date.now();
  if (!force && scopedCache[cacheKey] && scopedCache[cacheKey].expires > now) {
    return scopedCache[cacheKey].items;
  }

  const merged = await fetchAllFeeds(perFeed, sources);
  const unique = rankAndDedupe(merged);
  scopedCache[cacheKey] = { items: unique, expires: now + CACHE_TTL_MS };
  return unique;
}

export async function aggregateNews(options?: {
  category?: string;
  type?: NewsSourceType;
  source?: string;
  region?: string;
  country?: string;
  q?: string;
  limit?: number;
  offset?: number;
  force?: boolean;
}): Promise<NewsItem[]> {
  const limit = options?.limit ?? 48;
  const offset = options?.offset ?? 0;
  const videoDepth = Math.min(50, Math.max(20, limit + offset));
  let items =
    options?.type === "youtube"
      ? rankAndDedupe([
          ...(await getScopedNews(
            `youtube:${videoDepth}`,
            DEFAULT_FEEDS.filter((s) => s.type === "youtube"),
            videoDepth,
            options?.force
          )),
          ...(await getAllNews(options?.force)).filter((i) => i.sourceType === "youtube"),
        ])
      : await getAllNews(options?.force);

  if (options?.category && options.category !== "All") {
    items = items.filter((i) => matchesCategory(options.category!, i));
  }
  if (options?.type) {
    items = items.filter((i) => i.sourceType === options.type);
  }
  if (options?.source) {
    items = items.filter((i) => i.source === options.source);
  }
  if (options?.region) {
    items = items.filter((i) => i.region === options.region);
  }
  if (options?.country) {
    const c = options.country.toLowerCase();
    items = items.filter(
      (i) =>
        i.country.toLowerCase() === c ||
        i.title.toLowerCase().includes(c) ||
        (i.summary || "").toLowerCase().includes(c)
    );
  }
  if (options?.q) {
    const q = options.q.toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.summary || "").toLowerCase().includes(q) ||
        i.source.toLowerCase().includes(q)
    );
  }

  if (options?.type === "youtube") {
    items = sortNewestFirst(items);
  }

  return items.slice(offset, offset + limit);
}

/** Total count for a filtered query (for pagination metadata). */
export async function countNews(options?: {
  category?: string;
  type?: NewsSourceType;
  q?: string;
}): Promise<number> {
  const all = await aggregateNews({ ...options, limit: 10000, offset: 0 });
  return all.length;
}

export function getFeedCatalog(): FeedSource[] {
  return DEFAULT_FEEDS;
}
