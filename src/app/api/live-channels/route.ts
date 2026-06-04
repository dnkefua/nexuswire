import { NextResponse } from "next/server";
import { LIVE_CHANNELS } from "@/lib/live-channels";

export const dynamic = "force-dynamic";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

interface ResolvedChannel {
  id: string;
  name: string;
  region: string;
  country: string;
  videoId: string;
  live: boolean;
  watchUrl: string;
}

const cache: { data: ResolvedChannel[] | null; expires: number } = { data: null, expires: 0 };
const CACHE_TTL_MS = 4 * 60 * 1000;

async function timedFetch(url: string, headers: Record<string, string>): Promise<string | null> {
  try {
    const res = await fetch(url, { headers, redirect: "follow", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** The channel's most recent uploaded video — always a real, embeddable id. */
async function latestVideoId(channelId: string): Promise<string | null> {
  const xml = await timedFetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    { "User-Agent": UA }
  );
  return xml?.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1] || null;
}

/** The channel's current live broadcast id, only if it is actually live now. */
async function liveVideoId(channelId: string): Promise<string | null> {
  const html = await timedFetch(`https://www.youtube.com/channel/${channelId}/live`, {
    "User-Agent": UA,
    "Accept-Language": "en-US,en;q=0.9",
    Cookie: "CONSENT=YES+cb",
  });
  if (!html) return null;
  const isLiveNow = /"isLiveNow":true/.test(html) || /"isLive":true/.test(html) || /hlsManifestUrl/.test(html);
  if (!isLiveNow) return null;
  const id =
    html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/)?.[1] ||
    html.match(/"videoId":"([\w-]{11})"/)?.[1];
  return id || null;
}

export async function GET() {
  if (cache.data && cache.expires > Date.now()) {
    return NextResponse.json({ channels: cache.data });
  }

  const resolved = await Promise.all(
    LIVE_CHANNELS.map(async (c): Promise<ResolvedChannel | null> => {
      const live = await liveVideoId(c.channelId);
      // Prefer the live broadcast; otherwise the latest upload (never the bare
      // live_stream endpoint, which errors when the channel is offline).
      const videoId = live || (await latestVideoId(c.channelId));
      if (!videoId) return null; // no playable video → omit, never show "unavailable"
      return {
        id: c.id,
        name: c.name,
        region: c.region,
        country: c.country,
        videoId,
        live: !!live,
        watchUrl: `https://www.youtube.com/channel/${c.channelId}/live`,
      };
    })
  );

  const channels = resolved.filter((c): c is ResolvedChannel => c !== null);
  cache.data = channels;
  cache.expires = Date.now() + CACHE_TTL_MS;
  return NextResponse.json({ channels });
}
