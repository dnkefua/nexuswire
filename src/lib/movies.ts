import "server-only";
import Parser from "rss-parser";

export type MoviePlatform = "Web" | "YouTube";

export type MovieItem = {
  id: string;
  title: string;
  year: string;
  platform: MoviePlatform;
  source: string;
  genre: string;
  runtime: string;
  rights: string;
  description: string;
  poster: string;
  embedUrl: string;
  sourceUrl: string;
  videoId?: string;
  publishedAt?: string;
};

type YouTubeMovieSource = {
  id: string;
  name: string;
  channelId: string;
  genre: string;
  rights: string;
};

const parser = new Parser({
  customFields: {
    item: [
      ["media:group", "mediaGroup"],
      ["media:thumbnail", "mediaThumbnail"],
      ["yt:videoId", "videoId"],
    ],
  },
});

const youtubeSources: YouTubeMovieSource[] = [
  {
    id: "popcornflix-current",
    name: "Popcornflix",
    channelId: "UCX1nchEcBshItKBeJvH-YMw",
    genre: "Movies",
    rights: "Licensed free movie",
  },
  {
    id: "popcornflix",
    name: "Popcornflix Classics",
    channelId: "UCVFYikepF-avelvuIaQ_lHA",
    genre: "Movies",
    rights: "Licensed free movie",
  },
  {
    id: "movie-central",
    name: "Movie Central",
    channelId: "UCGBzBkV-MinlBvHBzZawfLQ",
    genre: "Movies",
    rights: "Licensed free movie",
  },
  {
    id: "maverick",
    name: "Maverick Movies",
    channelId: "UC2u3R3pjOiPZu4LtTlKkxdw",
    genre: "Movies",
    rights: "Licensed free movie",
  },
  {
    id: "samuel-goldwyn",
    name: "Samuel Goldwyn Films",
    channelId: "UCravBlrXZFH19MJYdtHijSA",
    genre: "Movies",
    rights: "Licensed free movie",
  },
  {
    id: "kings-of-horror",
    name: "Kings of Horror",
    channelId: "UC_VXBbJhc43aMuW0RtnmPsQ",
    genre: "Horror",
    rights: "Licensed free movie",
  },
];

const archiveMovies: MovieItem[] = [
  {
    id: "archive-night-of-the-living-dead",
    title: "Night of the Living Dead",
    year: "1968",
    platform: "Web",
    source: "Internet Archive",
    genre: "Horror",
    runtime: "96 min",
    rights: "Public domain",
    description:
      "George A. Romero's landmark independent horror film follows a group trapped in a farmhouse as the modern zombie genre takes shape.",
    poster: "https://archive.org/services/img/night-of-the-living-dead-1968",
    embedUrl: "https://archive.org/embed/night-of-the-living-dead-1968",
    sourceUrl: "https://archive.org/details/night-of-the-living-dead-1968",
  },
  {
    id: "archive-charade",
    title: "Charade",
    year: "1963",
    platform: "Web",
    source: "Internet Archive",
    genre: "Mystery comedy",
    runtime: "113 min",
    rights: "Public domain film",
    description:
      "Audrey Hepburn and Cary Grant move through Paris in a stylish blend of romance, comedy, suspense, and mistaken identity.",
    poster:
      "https://archive.org/services/img/charade-1963-cary-grant-audrey-hepburn-comedy-mystery-romance-thriller-full-movie",
    embedUrl:
      "https://archive.org/embed/charade-1963-cary-grant-audrey-hepburn-comedy-mystery-romance-thriller-full-movie",
    sourceUrl:
      "https://archive.org/details/charade-1963-cary-grant-audrey-hepburn-comedy-mystery-romance-thriller-full-movie",
  },
  {
    id: "archive-the-general",
    title: "The General",
    year: "1926",
    platform: "Web",
    source: "Internet Archive",
    genre: "Silent action",
    runtime: "75 min",
    rights: "Public domain",
    description:
      "Buster Keaton's locomotive chase masterpiece is lean, visual, and still astonishingly precise almost a century later.",
    poster: "https://archive.org/services/img/TheGeneral",
    embedUrl: "https://archive.org/embed/TheGeneral",
    sourceUrl: "https://archive.org/details/TheGeneral",
  },
  {
    id: "archive-sita",
    title: "Sita Sings the Blues",
    year: "2008",
    platform: "Web",
    source: "Internet Archive",
    genre: "Animation",
    runtime: "82 min",
    rights: "Creator-released",
    description:
      "Nina Paley's vivid animated feature connects the Ramayana, jazz vocals, and a modern breakup into one singular independent film.",
    poster: "https://archive.org/services/img/Sita_Sings_the_Blues",
    embedUrl: "https://archive.org/embed/Sita_Sings_the_Blues",
    sourceUrl: "https://archive.org/details/Sita_Sings_the_Blues",
  },
  {
    id: "archive-detour",
    title: "Detour",
    year: "1945",
    platform: "Web",
    source: "Internet Archive",
    genre: "Film noir",
    runtime: "68 min",
    rights: "Public domain",
    description:
      "A grim, efficient noir about a drifter, a dead man, and one of classic cinema's most poisonous chance encounters.",
    poster: "https://archive.org/services/img/detour-1945",
    embedUrl: "https://archive.org/embed/detour-1945",
    sourceUrl: "https://archive.org/details/detour-1945",
  },
  {
    id: "archive-the-stranger",
    title: "The Stranger",
    year: "1946",
    platform: "Web",
    source: "Internet Archive",
    genre: "Thriller",
    runtime: "95 min",
    rights: "Public domain",
    description:
      "Orson Welles directs and stars in a tense postwar thriller about a hidden Nazi fugitive living under a new identity.",
    poster: "https://archive.org/services/img/the_stranger_1946",
    embedUrl: "https://archive.org/embed/the_stranger_1946",
    sourceUrl: "https://archive.org/details/the_stranger_1946",
  },
];

const fullMoviePattern =
  /\b(full\s*(movie|film|length)|free\s*(movie|film)|watch\s*for\s*free|complete\s*(movie|film))\b/i;
const trailerPattern = /\b(trailer|teaser|clip|shorts?|scene|preview|behind\s+the\s+scenes)\b/i;

function extractVideoId(link?: string, fallback?: string): string | undefined {
  if (fallback) return fallback;
  const match = link?.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1];
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*\|\s*(full\s*(movie|film)|free\s*(movie|film)).*$/i, "")
    .replace(/\s*-\s*(full\s*(movie|film)|free\s*(movie|film)).*$/i, "")
    .replace(/\s*\((full\s*(movie|film)|free\s*(movie|film))\).*$/i, "")
    .trim();
}

function inferGenre(title: string, fallback: string): string {
  const t = title.toLowerCase();
  if (t.includes("horror") || t.includes("thriller")) return "Thriller";
  if (t.includes("romance") || t.includes("rom-com")) return "Romance";
  if (t.includes("comedy")) return "Comedy";
  if (t.includes("action") || t.includes("martial arts")) return "Action";
  if (t.includes("drama")) return "Drama";
  if (t.includes("sci fi") || t.includes("sci-fi")) return "Sci-fi";
  return fallback;
}

function inferYear(title: string, publishedAt?: string): string {
  const explicit = title.match(/\b(19\d{2}|20\d{2})\b/);
  if (explicit) return explicit[1];
  if (publishedAt) return new Date(publishedAt).getFullYear().toString();
  return "Free";
}

function summarize(title: string, source: string, raw = ""): string {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (cleaned.length > 60) return cleaned.slice(0, 220);
  return `${cleanTitle(title)} is a free full-length movie from ${source}, curated for in-app playback through the official YouTube embed.`;
}

async function fetchYouTubeSource(source: YouTubeMovieSource): Promise<MovieItem[]> {
  const feed = await parser.parseURL(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${source.channelId}`
  );

  const movies: MovieItem[] = [];
  for (const item of feed.items) {
    const title = item.title || "";
    const videoId = extractVideoId(item.link, (item as unknown as { videoId?: string }).videoId);
    if (!videoId || !fullMoviePattern.test(title) || trailerPattern.test(title)) continue;

    const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();
    const image = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    movies.push({
      id: `yt-${videoId}`,
      title: cleanTitle(title) || title,
      year: inferYear(title, publishedAt),
      platform: "YouTube",
      source: source.name,
      genre: inferGenre(title, source.genre),
      runtime: "Full movie",
      rights: source.rights,
      description: summarize(title, source.name, item.contentSnippet || item.content || ""),
      poster: image,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
      sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
      videoId,
      publishedAt,
    });
  }

  return movies;
}

function dedupeMovies(items: MovieItem[]): MovieItem[] {
  const seen = new Set<string>();
  const unique: MovieItem[] = [];
  for (const item of items) {
    const key = item.videoId || item.sourceUrl || item.title.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }
  return unique;
}

export async function aggregateMovies(options?: {
  limit?: number;
  q?: string;
  platform?: "all" | "web" | "youtube";
}): Promise<MovieItem[]> {
  const requestedLimit = Math.max(1, Math.min(Number(options?.limit || 120), 240));
  const platform = options?.platform || "all";
  const q = options?.q?.trim().toLowerCase();
  const youtubeItems =
    platform === "web" ? [] : (await Promise.allSettled(youtubeSources.map(fetchYouTubeSource)))
      .flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  const webItems = platform === "youtube" ? [] : archiveMovies;

  let items = dedupeMovies([...youtubeItems, ...webItems]);
  if (q) {
    items = items.filter((item) =>
      [item.title, item.source, item.genre, item.description].some((value) =>
        value.toLowerCase().includes(q)
      )
    );
  }

  items.sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });

  return items.slice(0, requestedLimit);
}
