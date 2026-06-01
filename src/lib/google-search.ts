import "server-only";

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

export function isCustomSearchConfigured(): boolean {
  return !!(process.env.GOOGLE_CUSTOM_SEARCH_API_KEY && process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID);
}

/**
 * Google Programmable Search (Custom Search JSON API). The engine should be
 * configured to search only trusted African publisher domains. Returns an empty
 * array when not configured so discovery degrades gracefully.
 */
export async function customSearch(query: string, num = 10): Promise<SearchResult[]> {
  if (!isCustomSearchConfigured()) return [];

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", process.env.GOOGLE_CUSTOM_SEARCH_API_KEY!);
  url.searchParams.set("cx", process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID!);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(Math.min(num, 10)));

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Custom Search HTTP ${res.status}`);
    const data = (await res.json()) as {
      items?: { title: string; link: string; snippet: string; displayLink: string }[];
    };
    return (data.items || []).map((i) => ({
      title: i.title,
      link: i.link,
      snippet: i.snippet,
      source: i.displayLink,
    }));
  } catch (e) {
    console.warn("[custom-search] failed:", e);
    return [];
  }
}
