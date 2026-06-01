import type { NewsItem } from "./types";
import { normalizeTitle } from "./dedupe";

export interface StoryCluster {
  id: string;
  title: string;
  summary: string;
  category: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
  articleIds: string[];
  sources: string[];
  items: NewsItem[];
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "as", "by", "at", "from", "is", "are", "was", "were", "be", "has", "have",
  "after", "over", "into", "amid", "says", "say", "new", "this", "that", "his",
  "her", "its", "their", "you", "will", "more", "than", "how", "why", "what",
]);

function keywords(title: string): Set<string> {
  return new Set(
    normalizeTitle(title)
      .split(" ")
      .filter((w) => w.length > 3 && !STOPWORDS.has(w))
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  let shared = 0;
  for (const w of a) if (b.has(w)) shared += 1;
  const denom = Math.min(a.size, b.size) || 1;
  return shared / denom;
}

/**
 * Lightweight keyword-overlap clustering. Groups stories that share a strong
 * majority of significant title keywords. Only clusters covered by 2+ distinct
 * sources are returned as visible clusters — we never overstate certainty.
 */
export function clusterStories(items: NewsItem[], threshold = 0.5): StoryCluster[] {
  const used = new Set<string>();
  const clusters: StoryCluster[] = [];

  for (let i = 0; i < items.length; i++) {
    const lead = items[i];
    if (used.has(lead.id)) continue;
    const leadKw = keywords(lead.title);
    if (leadKw.size === 0) continue;

    const members: NewsItem[] = [lead];
    used.add(lead.id);

    for (let j = i + 1; j < items.length; j++) {
      const cand = items[j];
      if (used.has(cand.id)) continue;
      if (overlap(leadKw, keywords(cand.title)) >= threshold) {
        members.push(cand);
        used.add(cand.id);
      }
    }

    const sources = Array.from(new Set(members.map((m) => m.source)));
    if (sources.length < 2) continue; // require multi-source coverage

    clusters.push({
      id: `cluster-${lead.id}`,
      title: lead.title,
      summary: lead.summary,
      category: lead.category,
      region: lead.region,
      createdAt: lead.publishedAt,
      updatedAt: members[members.length - 1].publishedAt,
      articleIds: members.map((m) => m.id),
      sources,
      items: members,
    });
  }

  // Most-covered clusters first
  return clusters.sort((a, b) => b.sources.length - a.sources.length);
}
