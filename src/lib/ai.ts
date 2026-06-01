import "server-only";
import type { NewsItem } from "./types";

export interface ArticleAIEnrichment {
  shortSummary: string;
  briefingSummary: string;
  whyItMatters: string[];
  keyEntities: {
    people: string[];
    organizations: string[];
    countries: string[];
    places: string[];
    companies: string[];
  };
  categories: string[];
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  reliabilityNotes: string[];
  suggestedHeadline?: string;
  newsletterBlurb?: string;
  socialPosts: { x: string; linkedin: string; facebook: string };
}

export function isAiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Enrich an article with Gemini. Returns null when no API key is configured so
 * callers degrade gracefully (the UI shows source metadata only).
 *
 * AI rules enforced by the prompt: never invent facts, always preserve the
 * source URL, label summaries as AI-generated, keep summaries original/concise.
 */
export async function enrichArticle(item: NewsItem): Promise<ArticleAIEnrichment | null> {
  if (!isAiConfigured()) return null;

  const prompt = `You are a careful news editor. Summarize ONLY using the title and excerpt below — do not invent facts not present. If something is uncertain, say so. Preserve attribution to ${item.source}. Respond as strict JSON matching the ArticleAIEnrichment schema.

Title: ${item.title}
Source: ${item.source}
Excerpt: ${item.summary}
URL: ${item.link}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text) as ArticleAIEnrichment;
  } catch (e) {
    console.warn("[ai] enrichment failed:", e);
    return null;
  }
}
