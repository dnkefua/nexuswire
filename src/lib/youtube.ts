import "server-only";
import type { NewsItem } from "./types";

export function isYouTubeApiConfigured(): boolean {
  return !!process.env.YOUTUBE_API_KEY;
}

/**
 * Fetch recent uploads from a channel via the YouTube Data API v3. When no API
 * key is configured, callers fall back to the channel's public RSS feed
 * (already handled by the RSS engine), so this returns an empty array.
 */
export async function fetchChannelVideos(
  channelId: string,
  channelName: string,
  max = 10
): Promise<NewsItem[]> {
  if (!isYouTubeApiConfigured()) return [];

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY!);
  url.searchParams.set("channelId", channelId);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("order", "date");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(Math.min(max, 25)));

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`YouTube API HTTP ${res.status}`);
    const data = (await res.json()) as {
      items?: {
        id: { videoId: string };
        snippet: { title: string; description: string; publishedAt: string; thumbnails: { high?: { url: string } } };
      }[];
    };
    return (data.items || []).map((v) => ({
      id: `yt-${v.id.videoId}`,
      title: v.snippet.title,
      summary: v.snippet.description.slice(0, 280),
      link: `https://www.youtube.com/watch?v=${v.id.videoId}`,
      image: v.snippet.thumbnails.high?.url || `https://i.ytimg.com/vi/${v.id.videoId}/hqdefault.jpg`,
      source: channelName,
      sourceType: "youtube" as const,
      category: "Video News",
      region: "Global",
      country: "Global",
      publishedAt: v.snippet.publishedAt,
      author: channelName,
      isLive: false,
      videoId: v.id.videoId,
    }));
  } catch (e) {
    console.warn("[youtube] fetch failed:", e);
    return [];
  }
}
