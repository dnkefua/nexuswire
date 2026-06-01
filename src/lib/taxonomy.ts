/** Shared category & country taxonomy for the African news platform. */

export const CATEGORIES = [
  "Top Stories",
  "Politics",
  "Business",
  "Markets",
  "Technology",
  "Startups",
  "Fintech",
  "Health",
  "Education",
  "Climate",
  "Energy",
  "Security",
  "Sports",
  "Culture",
  "Entertainment",
  "Diaspora",
  "Opinion",
  "Francophone Africa",
  "Video News",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Categories surfaced as primary chips on the home feed. */
export const PRIMARY_CATEGORIES = [
  "Top Stories",
  "Politics",
  "Business",
  "Markets",
  "Technology",
  "Startups",
  "Fintech",
  "Sports",
  "Health",
  "Energy",
  "Security",
  "Entertainment",
  "Video News",
];

/**
 * Keyword hints used to match an article to a category even when its source
 * feed didn't explicitly tag it. This guarantees category pages are never empty
 * just because no source is hard-tagged to that category.
 */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Politics: ["politic", "election", "president", "government", "minister", "parliament", "senate", "vote", "governor", "policy", "ruling party", "opposition", "coup"],
  Business: ["business", "econom", "trade", "gdp", "inflation", "investment", "bank", "finance", "revenue", "profit", "company", "ceo", "industry", "market"],
  Markets: ["market", "stocks", "shares", "index", "bond", "currency", "exchange rate", "naira", "rand", "cedi", "shilling", "forex", "commodity", "oil price", "nasdaq", "bourse"],
  Technology: ["tech", "software", "ai ", "artificial intelligence", "app", "digital", "internet", "gadget", "smartphone", "cyber", "data", "robot", "satellite"],
  Startups: ["startup", "funding", "raise", "seed round", "series a", "venture", " vc ", "founder", "accelerator", "incubator", "valuation"],
  Fintech: ["fintech", "payment", "mobile money", "crypto", "bitcoin", "wallet", "lending", "neobank", "remittance", "digital bank", "m-pesa"],
  Health: ["health", "hospital", "disease", "virus", "vaccine", "malaria", "cholera", "outbreak", "medical", "mpox", "doctor", "clinic", "covid", "ebola", "who "],
  Education: ["education", "school", "university", "student", "exam", "teacher", "scholarship", "waec", "jamb", "campus", "literacy"],
  Climate: ["climate", "drought", "flood", "emission", "carbon", "weather", "environment", "conservation", "wildlife", "deforest"],
  Energy: ["energy", "power", "electricity", "grid", " oil", " gas", "fuel", "petrol", "solar", "renewable", "blackout", "eskom", "pipeline", "refinery"],
  Security: ["security", "attack", "militant", "terror", "kidnap", "insurgency", "boko haram", "al-shabaab", "conflict", "clash", "military", "soldier", "gunmen", "bandit", "war"],
  Sports: ["sport", "football", "soccer", "match", "league", " cup", "goal", "fixture", "afcon", "premier league", " nba", "fifa", " caf ", "athletic", "rugby", "cricket", "tennis", "olympic", "championship", "coach", "striker", "super eagles", "bafana"],
  Entertainment: ["entertainment", "music", "movie", "film", "celebrity", "afrobeat", "nollywood", "album", "concert", "actor", "actress", "artist", "grammy", "premiere"],
  Culture: ["culture", " art", "heritage", "festival", "fashion", "tradition", "museum", "literature", "cuisine"],
  Diaspora: ["diaspora", "abroad", "immigrant", "remittance", "visa", "migration", "asylum", "expat"],
  Opinion: ["opinion", "editorial", "comment", "analysis", "viewpoint", "column"],
};

/**
 * Whether an article belongs to a category. Matches by explicit feed category,
 * YouTube type for Video News, or keyword hints in the title/summary.
 */
export function matchesCategory(
  target: string,
  item: { title: string; summary?: string; category: string; sourceType?: string }
): boolean {
  if (!target || target === "All" || target === "Top Stories") return true;
  if (item.category === target) return true;
  if (target === "Video News") return item.sourceType === "youtube";
  const keywords = CATEGORY_KEYWORDS[target];
  if (!keywords) return false;
  const hay = `${item.title} ${item.summary || ""}`.toLowerCase();
  return keywords.some((k) => hay.includes(k));
}

export interface CountryDef {
  slug: string;
  name: string;
  flag: string;
  region: string;
}

export const COUNTRIES: CountryDef[] = [
  { slug: "nigeria", name: "Nigeria", flag: "🇳🇬", region: "West Africa" },
  { slug: "ghana", name: "Ghana", flag: "🇬🇭", region: "West Africa" },
  { slug: "kenya", name: "Kenya", flag: "🇰🇪", region: "East Africa" },
  { slug: "south-africa", name: "South Africa", flag: "🇿🇦", region: "Southern Africa" },
  { slug: "cameroon", name: "Cameroon", flag: "🇨🇲", region: "Central Africa" },
  { slug: "ethiopia", name: "Ethiopia", flag: "🇪🇹", region: "East Africa" },
  { slug: "senegal", name: "Senegal", flag: "🇸🇳", region: "West Africa" },
  { slug: "cote-divoire", name: "Côte d’Ivoire", flag: "🇨🇮", region: "West Africa" },
  { slug: "rwanda", name: "Rwanda", flag: "🇷🇼", region: "East Africa" },
  { slug: "tanzania", name: "Tanzania", flag: "🇹🇿", region: "East Africa" },
  { slug: "uganda", name: "Uganda", flag: "🇺🇬", region: "East Africa" },
  { slug: "egypt", name: "Egypt", flag: "🇪🇬", region: "North Africa" },
  { slug: "morocco", name: "Morocco", flag: "🇲🇦", region: "North Africa" },
  { slug: "algeria", name: "Algeria", flag: "🇩🇿", region: "North Africa" },
  { slug: "pan-african", name: "Pan-African", flag: "🌍", region: "Pan-African" },
];

export function countryBySlug(slug: string): CountryDef | undefined {
  return COUNTRIES.find((c) => c.slug === slug);
}

export function categoryToSlug(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function slugToCategory(slug: string): string | undefined {
  return CATEGORIES.find((c) => categoryToSlug(c) === slug);
}
