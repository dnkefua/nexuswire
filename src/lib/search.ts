import { DEFAULT_FEEDS } from "./feeds";
import { fetchFeed } from "./rss";
import type { NewsItem, SearchFacet } from "./types";

export const SEARCH_FACETS: { id: SearchFacet; label: string; description: string }[] = [
  { id: "all", label: "All", description: "Every source" },
  { id: "countries", label: "Countries", description: "Filter by nation" },
  { id: "videos", label: "Videos", description: "YouTube & video feeds" },
  { id: "newspaper", label: "Newspapers", description: "Wire & print RSS" },
  { id: "blogs", label: "Blogs", description: "Editorial & tech blogs" },
];

export function getSearchCountries(): string[] {
  const countries = new Set(DEFAULT_FEEDS.map((f) => f.country));
  return Array.from(countries).sort();
}

function facetToSourceType(facet: SearchFacet): NewsItem["sourceType"] | null {
  if (facet === "videos") return "youtube";
  if (facet === "newspaper") return "rss";
  if (facet === "blogs") return "blog";
  return null;
}

function matchesQuery(item: NewsItem, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const haystack = [
    item.title,
    item.summary,
    item.source,
    item.category,
    item.country,
    item.region,
    item.author || "",
  ]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

function matchesCountry(item: NewsItem, country: string): boolean {
  if (!country || country === "All") return true;
  return (
    item.country.toLowerCase() === country.toLowerCase() ||
    item.region.toLowerCase() === country.toLowerCase()
  );
}

export async function searchNews(options: {
  query?: string;
  facet?: SearchFacet;
  country?: string;
  limit?: number;
}): Promise<{ items: NewsItem[]; total: number }> {
  const facet = options.facet || "all";
  const limit = Math.min(options.limit ?? 50, 80);
  const query = options.query?.trim() || "";
  const country = options.country?.trim() || "";

  let sources = DEFAULT_FEEDS;

  const sourceType = facetToSourceType(facet);
  if (sourceType) {
    sources = sources.filter((s) => s.type === sourceType);
  }

  if (facet === "countries" && country && country !== "All") {
    sources = sources.filter(
      (s) =>
        s.country.toLowerCase() === country.toLowerCase() ||
        s.region.toLowerCase() === country.toLowerCase()
    );
  } else if (country && country !== "All") {
    sources = sources.filter(
      (s) =>
        s.country.toLowerCase() === country.toLowerCase() ||
        s.region.toLowerCase() === country.toLowerCase()
    );
  }

  const perFeed = query ? 12 : 8;
  const batches = await Promise.all(sources.map((s) => fetchFeed(s, perFeed)));
  let items = batches.flat();

  items.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  if (query) {
    items = items.filter((item) => matchesQuery(item, query));
  }

  if (facet === "countries" && country && country !== "All") {
    items = items.filter((item) => matchesCountry(item, country));
  } else if (country && country !== "All") {
    items = items.filter((item) => matchesCountry(item, country));
  }

  const seen = new Set<string>();
  const unique: NewsItem[] = [];
  for (const item of items) {
    const key = item.id;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  const total = unique.length;
  return { items: unique.slice(0, limit), total };
}
