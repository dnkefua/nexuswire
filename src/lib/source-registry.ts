import type { FeedSource } from "./types";

export type AfricaRegion =
  | "West Africa"
  | "East Africa"
  | "Central Africa"
  | "Southern Africa"
  | "North Africa"
  | "Pan-African"
  | "Global";

export type SourceKind =
  | "rss"
  | "website"
  | "youtube"
  | "google_news_rss"
  | "custom_search";

/** Premium source-registry entry (per NexusWire African news spec). */
export interface NewsSource {
  id: string;
  name: string;
  country: string;
  region: AfricaRegion;
  language: string;
  sourceType: SourceKind;
  homepageUrl: string;
  rssUrl?: string;
  youtubeChannelId?: string;
  credibilityScore: number; // 0–100
  categories: string[];
  active: boolean;
  lastFetchedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const NOW = "2025-06-01T00:00:00.000Z";

function s(
  partial: Omit<NewsSource, "active" | "createdAt" | "updatedAt"> &
    Partial<Pick<NewsSource, "active">>
): NewsSource {
  return {
    active: partial.active ?? true,
    createdAt: NOW,
    updatedAt: NOW,
    ...partial,
  };
}

/**
 * Trusted source registry. Primary base is verified African publishers, with
 * international Africa desks and Google News RSS used only for discovery.
 * Credibility scores gate ranking — discovery feeds never outrank publishers.
 */
export const NEWS_SOURCES: NewsSource[] = [
  // ── Nigeria (West Africa) ──────────────────────────────────────────────
  s({ id: "ng-premiumtimes", name: "Premium Times", country: "Nigeria", region: "West Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.premiumtimesng.com", rssUrl: "https://www.premiumtimesng.com/feed", credibilityScore: 90, categories: ["Politics", "Business", "Top Stories"] }),
  s({ id: "ng-punch", name: "The Punch", country: "Nigeria", region: "West Africa", language: "en", sourceType: "rss", homepageUrl: "https://punchng.com", rssUrl: "https://punchng.com/feed/", credibilityScore: 85, categories: ["Top Stories", "Politics", "Sports"] }),
  s({ id: "ng-vanguard", name: "Vanguard", country: "Nigeria", region: "West Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.vanguardngr.com", rssUrl: "https://www.vanguardngr.com/feed/", credibilityScore: 84, categories: ["Top Stories", "Politics", "Business"] }),
  s({ id: "ng-businessday", name: "BusinessDay Nigeria", country: "Nigeria", region: "West Africa", language: "en", sourceType: "rss", homepageUrl: "https://businessday.ng", rssUrl: "https://businessday.ng/feed/", credibilityScore: 86, categories: ["Business", "Markets", "Fintech"] }),
  s({ id: "ng-channels", name: "Channels TV", country: "Nigeria", region: "West Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.channelstv.com", rssUrl: "https://www.channelstv.com/feed/", credibilityScore: 85, categories: ["Top Stories", "Politics"] }),
  s({ id: "ng-guardian", name: "The Guardian Nigeria", country: "Nigeria", region: "West Africa", language: "en", sourceType: "rss", homepageUrl: "https://guardian.ng", rssUrl: "https://guardian.ng/feed/", credibilityScore: 85, categories: ["Top Stories", "Politics", "Business"] }),

  // ── Ghana (West Africa) ────────────────────────────────────────────────
  s({ id: "gh-citinewsroom", name: "Citi Newsroom", country: "Ghana", region: "West Africa", language: "en", sourceType: "rss", homepageUrl: "https://citinewsroom.com", rssUrl: "https://citinewsroom.com/feed/", credibilityScore: 83, categories: ["Top Stories", "Politics", "Business"] }),
  s({ id: "gh-myjoyonline", name: "Joy Online", country: "Ghana", region: "West Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.myjoyonline.com", rssUrl: "https://www.myjoyonline.com/feed/", credibilityScore: 83, categories: ["Top Stories", "Politics"] }),
  s({ id: "gh-graphic", name: "Graphic Online", country: "Ghana", region: "West Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.graphic.com.gh", rssUrl: "https://www.graphic.com.gh/?format=feed&type=rss", credibilityScore: 82, categories: ["Top Stories", "Business"] }),

  // ── Kenya (East Africa) ────────────────────────────────────────────────
  s({ id: "ke-standard", name: "The Standard Kenya", country: "Kenya", region: "East Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.standardmedia.co.ke", rssUrl: "https://www.standardmedia.co.ke/rss/headlines.php", credibilityScore: 83, categories: ["Top Stories", "Politics", "Business"] }),
  s({ id: "ke-citizen", name: "Citizen Digital", country: "Kenya", region: "East Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.citizen.digital", rssUrl: "https://www.citizen.digital/rss", credibilityScore: 80, categories: ["Top Stories", "Politics"] }),
  s({ id: "ke-businessdaily", name: "Business Daily Africa", country: "Kenya", region: "East Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.businessdailyafrica.com", rssUrl: "https://www.businessdailyafrica.com/bd/rss", credibilityScore: 85, categories: ["Business", "Markets", "Fintech"] }),

  // ── South Africa (Southern Africa) ─────────────────────────────────────
  s({ id: "za-news24", name: "News24", country: "South Africa", region: "Southern Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.news24.com", rssUrl: "https://feeds.24.com/articles/news24/TopStories/rss", credibilityScore: 88, categories: ["Top Stories", "Politics", "Business"] }),
  s({ id: "za-dailymaverick", name: "Daily Maverick", country: "South Africa", region: "Southern Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.dailymaverick.co.za", rssUrl: "https://www.dailymaverick.co.za/dmrss/", credibilityScore: 89, categories: ["Politics", "Opinion", "Business"] }),
  s({ id: "za-businesstech", name: "BusinessTech", country: "South Africa", region: "Southern Africa", language: "en", sourceType: "rss", homepageUrl: "https://businesstech.co.za", rssUrl: "https://businesstech.co.za/news/feed/", credibilityScore: 82, categories: ["Business", "Technology", "Markets"] }),
  s({ id: "za-mg", name: "Mail & Guardian", country: "South Africa", region: "Southern Africa", language: "en", sourceType: "rss", homepageUrl: "https://mg.co.za", rssUrl: "https://mg.co.za/feed/", credibilityScore: 87, categories: ["Politics", "Opinion", "Top Stories"] }),
  s({ id: "za-sabc", name: "SABC News", country: "South Africa", region: "Southern Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.sabcnews.com", rssUrl: "https://www.sabcnews.com/sabcnews/feed/", credibilityScore: 83, categories: ["Top Stories", "Politics", "Sports"] }),

  // ── Cameroon (Central Africa) ──────────────────────────────────────────
  s({ id: "cm-journalducameroun", name: "Journal du Cameroun", country: "Cameroon", region: "Central Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.journalducameroun.com", rssUrl: "https://www.journalducameroun.com/en/feed/", credibilityScore: 80, categories: ["Top Stories", "Politics", "Business"] }),
  s({ id: "cm-cna", name: "Cameroon News Agency", country: "Cameroon", region: "Central Africa", language: "en", sourceType: "rss", homepageUrl: "https://cameroonnewsagency.com", rssUrl: "https://cameroonnewsagency.com/feed/", credibilityScore: 76, categories: ["Top Stories", "Politics"] }),
  s({ id: "cm-businessincmr", name: "Business in Cameroon", country: "Cameroon", region: "Central Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.businessincameroon.com", rssUrl: "https://www.businessincameroon.com/feed", credibilityScore: 79, categories: ["Business", "Markets", "Fintech"] }),

  // ── Pan-African / Regional ─────────────────────────────────────────────
  s({ id: "pa-africanews", name: "Africanews", country: "Pan-African", region: "Pan-African", language: "en", sourceType: "rss", homepageUrl: "https://www.africanews.com", rssUrl: "https://www.africanews.com/feed/rss", credibilityScore: 86, categories: ["Top Stories", "Politics", "Business"] }),
  s({ id: "pa-allafrica", name: "AllAfrica", country: "Pan-African", region: "Pan-African", language: "en", sourceType: "rss", homepageUrl: "https://allafrica.com", rssUrl: "https://allafrica.com/tools/headlines/rdf/africa/headlines.rdf", credibilityScore: 82, categories: ["Top Stories", "Politics"] }),
  s({ id: "pa-theafricareport", name: "The Africa Report", country: "Pan-African", region: "Pan-African", language: "en", sourceType: "rss", homepageUrl: "https://www.theafricareport.com", rssUrl: "https://www.theafricareport.com/feed/", credibilityScore: 87, categories: ["Politics", "Business", "Opinion"] }),
  s({ id: "pa-techcabal", name: "TechCabal", country: "Pan-African", region: "Pan-African", language: "en", sourceType: "rss", homepageUrl: "https://techcabal.com", rssUrl: "https://techcabal.com/feed/", credibilityScore: 85, categories: ["Technology", "Startups", "Fintech"] }),
  s({ id: "pa-disruptafrica", name: "Disrupt Africa", country: "Pan-African", region: "Pan-African", language: "en", sourceType: "rss", homepageUrl: "https://disrupt-africa.com", rssUrl: "https://disrupt-africa.com/feed/", credibilityScore: 83, categories: ["Startups", "Technology", "Fintech"] }),
  s({ id: "pa-restofworld", name: "Rest of World", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://restofworld.org", rssUrl: "https://restofworld.org/feed/latest/", credibilityScore: 86, categories: ["Technology", "Startups"] }),

  // ── Francophone Africa ─────────────────────────────────────────────────
  s({ id: "fr-jeuneafrique", name: "Jeune Afrique", country: "Pan-African", region: "Pan-African", language: "fr", sourceType: "rss", homepageUrl: "https://www.jeuneafrique.com", rssUrl: "https://www.jeuneafrique.com/feed/", credibilityScore: 87, categories: ["Francophone Africa", "Politics", "Business"] }),
  s({ id: "fr-rfiafrique", name: "RFI Afrique", country: "Pan-African", region: "Pan-African", language: "fr", sourceType: "rss", homepageUrl: "https://www.rfi.fr/fr/afrique", rssUrl: "https://www.rfi.fr/fr/afrique/rss", credibilityScore: 86, categories: ["Francophone Africa", "Politics"] }),
  s({ id: "fr-lemondeafrique", name: "Le Monde Afrique", country: "Pan-African", region: "Pan-African", language: "fr", sourceType: "rss", homepageUrl: "https://www.lemonde.fr/afrique", rssUrl: "https://www.lemonde.fr/afrique/rss_full.xml", credibilityScore: 88, categories: ["Francophone Africa", "Politics", "Opinion"] }),
  s({ id: "fr-financialafrik", name: "Financial Afrik", country: "Pan-African", region: "Pan-African", language: "fr", sourceType: "rss", homepageUrl: "https://www.financialafrik.com", rssUrl: "https://www.financialafrik.com/feed/", credibilityScore: 81, categories: ["Business", "Markets", "Fintech", "Francophone Africa"] }),

  // ── International Africa desks ─────────────────────────────────────────
  s({ id: "intl-bbcafrica", name: "BBC Africa", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.bbc.com/news/world/africa", rssUrl: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", credibilityScore: 92, categories: ["Top Stories", "Politics", "Business"] }),
  s({ id: "intl-aljazeera", name: "Al Jazeera", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.aljazeera.com", rssUrl: "https://www.aljazeera.com/xml/rss/all.xml", credibilityScore: 88, categories: ["Top Stories", "Politics", "Security"] }),
  s({ id: "intl-france24africa", name: "France 24 Africa", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.france24.com/en/africa", rssUrl: "https://www.france24.com/en/africa/rss", credibilityScore: 87, categories: ["Top Stories", "Politics"] }),
  s({ id: "intl-dwafrica", name: "DW News", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.dw.com", rssUrl: "https://rss.dw.com/rdf/rss-en-world", credibilityScore: 88, categories: ["Top Stories", "Politics", "Business"] }),

  // ── Google News RSS discovery (low base credibility — discovery only) ───
  s({ id: "gnews-ng", name: "Google News — Nigeria", country: "Nigeria", region: "West Africa", language: "en", sourceType: "google_news_rss", homepageUrl: "https://news.google.com", rssUrl: "https://news.google.com/rss?hl=en-NG&gl=NG&ceid=NG:en", credibilityScore: 55, categories: ["Top Stories"] }),
  s({ id: "gnews-za", name: "Google News — South Africa", country: "South Africa", region: "Southern Africa", language: "en", sourceType: "google_news_rss", homepageUrl: "https://news.google.com", rssUrl: "https://news.google.com/rss?hl=en-ZA&gl=ZA&ceid=ZA:en", credibilityScore: 55, categories: ["Top Stories"] }),
  s({ id: "gnews-ke", name: "Google News — Kenya", country: "Kenya", region: "East Africa", language: "en", sourceType: "google_news_rss", homepageUrl: "https://news.google.com", rssUrl: "https://news.google.com/rss?hl=en-KE&gl=KE&ceid=KE:en", credibilityScore: 55, categories: ["Top Stories"] }),
  s({ id: "gnews-cm", name: "Google News — Cameroon", country: "Cameroon", region: "Central Africa", language: "en", sourceType: "google_news_rss", homepageUrl: "https://news.google.com", rssUrl: "https://news.google.com/rss/search?q=Cameroon&hl=en&gl=CM&ceid=CM:en", credibilityScore: 55, categories: ["Top Stories"] }),

  // ── Sports ─────────────────────────────────────────────────────────────
  s({ id: "sp-bbcsport-africa", name: "BBC Sport Africa", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.bbc.com/sport/africa", rssUrl: "https://feeds.bbci.co.uk/sport/africa/rss.xml", credibilityScore: 90, categories: ["Sports"] }),
  s({ id: "sp-bbcsport", name: "BBC Sport", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.bbc.com/sport", rssUrl: "https://feeds.bbci.co.uk/sport/rss.xml", credibilityScore: 89, categories: ["Sports"] }),
  s({ id: "sp-guardian-sport", name: "Guardian Sport", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.theguardian.com/sport", rssUrl: "https://www.theguardian.com/sport/rss", credibilityScore: 86, categories: ["Sports"] }),
  s({ id: "sp-skysports", name: "Sky Sports", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.skysports.com", rssUrl: "https://www.skysports.com/rss/12040", credibilityScore: 83, categories: ["Sports"] }),
  s({ id: "sp-completesports", name: "Complete Sports", country: "Nigeria", region: "West Africa", language: "en", sourceType: "rss", homepageUrl: "https://www.completesports.com", rssUrl: "https://www.completesports.com/feed/", credibilityScore: 78, categories: ["Sports"] }),
  s({ id: "gnews-sport-africa", name: "Google News — African Sport", country: "Pan-African", region: "Pan-African", language: "en", sourceType: "google_news_rss", homepageUrl: "https://news.google.com", rssUrl: "https://news.google.com/rss/search?q=African+football+OR+AFCON+OR+sport&hl=en&ceid=US:en", credibilityScore: 55, categories: ["Sports"] }),

  // ── Business / Markets / Tech (fills high-volume categories) ───────────
  s({ id: "biz-cnbcafrica", name: "CNBC Africa", country: "Pan-African", region: "Pan-African", language: "en", sourceType: "rss", homepageUrl: "https://www.cnbcafrica.com", rssUrl: "https://www.cnbcafrica.com/feed/", credibilityScore: 84, categories: ["Business", "Markets"] }),
  s({ id: "biz-africanbusiness", name: "African Business", country: "Pan-African", region: "Pan-African", language: "en", sourceType: "rss", homepageUrl: "https://african.business", rssUrl: "https://african.business/feed", credibilityScore: 83, categories: ["Business", "Markets"] }),
  s({ id: "biz-guardian", name: "Guardian Business", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.theguardian.com/business", rssUrl: "https://www.theguardian.com/uk/business/rss", credibilityScore: 86, categories: ["Business", "Markets"] }),
  s({ id: "gnews-biz-africa", name: "Google News — Africa Business", country: "Pan-African", region: "Pan-African", language: "en", sourceType: "google_news_rss", homepageUrl: "https://news.google.com", rssUrl: "https://news.google.com/rss/search?q=Africa+business+OR+economy+OR+markets&hl=en&ceid=US:en", credibilityScore: 55, categories: ["Business"] }),
  s({ id: "tech-verge", name: "The Verge", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.theverge.com", rssUrl: "https://www.theverge.com/rss/index.xml", credibilityScore: 84, categories: ["Technology"] }),
  s({ id: "tech-techcrunch", name: "TechCrunch", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://techcrunch.com", rssUrl: "https://techcrunch.com/feed/", credibilityScore: 85, categories: ["Technology", "Startups"] }),

  // ── Health / Energy / Climate / Entertainment ──────────────────────────
  s({ id: "hl-healthpolicywatch", name: "Health Policy Watch", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://healthpolicy-watch.news", rssUrl: "https://healthpolicy-watch.news/feed/", credibilityScore: 82, categories: ["Health"] }),
  s({ id: "hl-guardian", name: "Guardian Health", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.theguardian.com/society/health", rssUrl: "https://www.theguardian.com/society/health/rss", credibilityScore: 85, categories: ["Health"] }),
  s({ id: "gnews-health-africa", name: "Google News — Africa Health", country: "Pan-African", region: "Pan-African", language: "en", sourceType: "google_news_rss", homepageUrl: "https://news.google.com", rssUrl: "https://news.google.com/rss/search?q=Africa+health+OR+disease+OR+hospital&hl=en&ceid=US:en", credibilityScore: 55, categories: ["Health"] }),
  s({ id: "en-guardian-energy", name: "Guardian Energy", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.theguardian.com/environment/energy", rssUrl: "https://www.theguardian.com/environment/energy/rss", credibilityScore: 85, categories: ["Energy"] }),
  s({ id: "cl-guardian-env", name: "Guardian Environment", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.theguardian.com/environment", rssUrl: "https://www.theguardian.com/environment/rss", credibilityScore: 85, categories: ["Climate"] }),
  s({ id: "gnews-energy-africa", name: "Google News — Africa Energy", country: "Pan-African", region: "Pan-African", language: "en", sourceType: "google_news_rss", homepageUrl: "https://news.google.com", rssUrl: "https://news.google.com/rss/search?q=Africa+energy+OR+power+OR+electricity&hl=en&ceid=US:en", credibilityScore: 55, categories: ["Energy"] }),
  s({ id: "et-bbc-arts", name: "BBC Entertainment & Arts", country: "Global", region: "Global", language: "en", sourceType: "rss", homepageUrl: "https://www.bbc.com/news/entertainment_and_arts", rssUrl: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", credibilityScore: 84, categories: ["Entertainment", "Culture"] }),
  s({ id: "gnews-ent-africa", name: "Google News — Africa Entertainment", country: "Pan-African", region: "Pan-African", language: "en", sourceType: "google_news_rss", homepageUrl: "https://news.google.com", rssUrl: "https://news.google.com/rss/search?q=Afrobeats+OR+Nollywood+OR+African+music&hl=en&ceid=US:en", credibilityScore: 55, categories: ["Entertainment"] }),

  // ── YouTube news & live channels (Video News / Live) ────────────────────
  s({ id: "yt-aljazeera", name: "Al Jazeera English", country: "Global", region: "Global", language: "en", sourceType: "youtube", homepageUrl: "https://www.youtube.com/@aljazeeraenglish", youtubeChannelId: "UCNye-wNBqNL5ZzHSJj3l8Bg", rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCNye-wNBqNL5ZzHSJj3l8Bg", credibilityScore: 86, categories: ["Video News", "Top Stories"] }),
  s({ id: "yt-dwnews", name: "DW News", country: "Global", region: "Global", language: "en", sourceType: "youtube", homepageUrl: "https://www.youtube.com/@dwnews", youtubeChannelId: "UCknLrEdhRCp1aegoMqRaCZg", rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCknLrEdhRCp1aegoMqRaCZg", credibilityScore: 87, categories: ["Video News", "Top Stories"] }),
  s({ id: "yt-skynews", name: "Sky News", country: "Global", region: "Global", language: "en", sourceType: "youtube", homepageUrl: "https://www.youtube.com/@SkyNews", youtubeChannelId: "UCoMdktPbSTixAyNGwb-UYkQ", rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCoMdktPbSTixAyNGwb-UYkQ", credibilityScore: 85, categories: ["Video News", "Top Stories"] }),
  s({ id: "yt-cnbc", name: "CNBC", country: "Global", region: "Global", language: "en", sourceType: "youtube", homepageUrl: "https://www.youtube.com/@CNBC", youtubeChannelId: "UCvJJ_dzjViJCoLf5uKUTwoA", rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCvJJ_dzjViJCoLf5uKUTwoA", credibilityScore: 84, categories: ["Video News", "Business"] }),
  s({ id: "yt-bloomberg", name: "Bloomberg", country: "Global", region: "Global", language: "en", sourceType: "youtube", homepageUrl: "https://www.youtube.com/@markets", youtubeChannelId: "UCIALMKvObZNtJ6AmdCLP7Lg", rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCIALMKvObZNtJ6AmdCLP7Lg", credibilityScore: 85, categories: ["Video News", "Business"] }),
  s({ id: "yt-trtworld", name: "TRT World", country: "Global", region: "Global", language: "en", sourceType: "youtube", homepageUrl: "https://www.youtube.com/@trtworld", youtubeChannelId: "UC7fWeaHhqgM4Ry-RMpM2YYw", rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UC7fWeaHhqgM4Ry-RMpM2YYw", credibilityScore: 80, categories: ["Video News", "Top Stories"] }),
  s({ id: "yt-wion", name: "WION", country: "Global", region: "Global", language: "en", sourceType: "youtube", homepageUrl: "https://www.youtube.com/@WION", youtubeChannelId: "UC_gUM8rL-Lrg6O3adPW9K1g", rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UC_gUM8rL-Lrg6O3adPW9K1g", credibilityScore: 78, categories: ["Video News", "Top Stories"] }),
  s({ id: "yt-espn", name: "ESPN", country: "Global", region: "Global", language: "en", sourceType: "youtube", homepageUrl: "https://www.youtube.com/@espn", youtubeChannelId: "UCiWLfSweyRNmLpgEHekhoAg", rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCiWLfSweyRNmLpgEHekhoAg", credibilityScore: 80, categories: ["Video News", "Sports"] }),
  s({ id: "yt-guardian", name: "The Guardian", country: "Global", region: "Global", language: "en", sourceType: "youtube", homepageUrl: "https://www.youtube.com/@guardian", youtubeChannelId: "UCHpw8xwDNhU9gdohEcJu4aA", rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCHpw8xwDNhU9gdohEcJu4aA", credibilityScore: 86, categories: ["Video News", "Top Stories"] }),
  s({ id: "yt-nbcnews", name: "NBC News", country: "Global", region: "Global", language: "en", sourceType: "youtube", homepageUrl: "https://www.youtube.com/@NBCNews", youtubeChannelId: "UCeY0bbntWzzVIaj2z3QigXg", rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCeY0bbntWzzVIaj2z3QigXg", credibilityScore: 83, categories: ["Video News", "Top Stories"] }),
];

/** Map a registry NewsSource → the FeedSource shape the RSS engine consumes. */
export function toFeedSource(src: NewsSource): FeedSource {
  const type: FeedSource["type"] =
    src.sourceType === "youtube"
      ? "youtube"
      : src.categories.some((c) => ["Startups", "Technology", "Opinion"].includes(c)) && src.sourceType === "rss"
        ? "blog"
        : "rss";
  return {
    id: src.id,
    name: src.name,
    url: src.rssUrl || src.homepageUrl,
    type,
    category: src.categories[0] || "Top Stories",
    region: src.region,
    country: src.country,
    credibilityScore: src.credibilityScore,
    googleNews: src.sourceType === "google_news_rss",
  };
}

export function getActiveFeedSources(): FeedSource[] {
  return NEWS_SOURCES.filter((s) => s.active).map(toFeedSource);
}
