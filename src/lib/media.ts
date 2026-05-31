/** Parse common video URLs into embed-friendly links. */
export function parseMediaUrl(url: string): {
  embedUrl?: string;
  thumbnailUrl?: string;
  platform?: "youtube" | "tiktok" | "vimeo";
} {
  const trimmed = url.trim();
  if (!trimmed) return {};

  const yt =
    trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/) ||
    trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (yt?.[1]) {
    const id = yt[1];
    return {
      platform: "youtube",
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  const tiktok = trimmed.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
  if (tiktok?.[1]) {
    return {
      platform: "tiktok",
      embedUrl: `https://www.tiktok.com/embed/v2/${tiktok[1]}`,
    };
  }

  const vimeo = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeo?.[1]) {
    return {
      platform: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}`,
    };
  }

  return {};
}

export function platformLabel(platform: string): string {
  const labels: Record<string, string> = {
    website: "Website",
    rss: "News RSS",
    youtube: "YouTube",
    tiktok: "TikTok",
    twitter: "X / Twitter",
    instagram: "Instagram",
  };
  return labels[platform] || platform;
}
