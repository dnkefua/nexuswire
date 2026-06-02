import type { MetadataRoute } from "next";
import { COUNTRIES, PRIMARY_CATEGORIES, categoryToSlug } from "@/lib/taxonomy";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://nexuswire.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const countryPages = COUNTRIES.map((c) => ({
    url: `${BASE}/country/${c.slug}`,
    priority: 0.7,
    changeFrequency: "hourly" as const,
  }));
  const topicPages = PRIMARY_CATEGORIES.map((cat) => ({
    url: `${BASE}/topic/${categoryToSlug(cat)}`,
    priority: 0.6,
    changeFrequency: "hourly" as const,
  }));

  const staticPages = [
    { url: BASE, priority: 1.0, changeFrequency: "hourly" as const },
    { url: `${BASE}/briefing`, priority: 0.9, changeFrequency: "hourly" as const },
    { url: `${BASE}/trending`, priority: 0.8, changeFrequency: "hourly" as const },
    { url: `${BASE}/live`, priority: 0.9, changeFrequency: "hourly" as const },
    { url: `${BASE}/movies`, priority: 0.7, changeFrequency: "daily" as const },
    { url: `${BASE}/search`, priority: 0.8, changeFrequency: "daily" as const },
    ...countryPages,
    ...topicPages,
    { url: `${BASE}/journalists`, priority: 0.7, changeFrequency: "daily" as const },
    { url: `${BASE}/community`, priority: 0.6, changeFrequency: "daily" as const },
    { url: `${BASE}/about`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${BASE}/editorial-policy`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${BASE}/source-policy`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${BASE}/corrections`, priority: 0.4, changeFrequency: "monthly" as const },
    { url: `${BASE}/privacy`, priority: 0.4, changeFrequency: "monthly" as const },
    { url: `${BASE}/terms`, priority: 0.4, changeFrequency: "monthly" as const },
    { url: `${BASE}/dmca`, priority: 0.4, changeFrequency: "monthly" as const },
    { url: `${BASE}/contact`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${BASE}/pricing`, priority: 0.6, changeFrequency: "monthly" as const },
  ];

  return staticPages.map(({ url, priority, changeFrequency }) => ({
    url,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
