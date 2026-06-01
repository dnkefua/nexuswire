import { NextResponse } from "next/server";
import { aggregateNews } from "@/lib/rss";
import type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Daily briefing — assembled deterministically from aggregated, source-attributed
 * articles. No AI claims are invented here; sections are pure metadata groupings.
 * (AI enrichment can later replace the heuristic summaries — see /lib/ai.ts.)
 */
export async function GET() {
  try {
    const all = await aggregateNews({ limit: 200 });

    const pick = (cat: string, n: number): NewsItem[] =>
      all.filter((i) => i.category === cat).slice(0, n);

    const topStories = all.slice(0, 10);

    const briefing = {
      date: new Date().toISOString(),
      topStories,
      business: pick("Business", 5),
      markets: pick("Markets", 4),
      startupsFintech: all
        .filter((i) => i.category === "Startups" || i.category === "Fintech")
        .slice(0, 5),
      security: pick("Security", 4),
      technology: pick("Technology", 4),
      sourceCount: new Set(all.map((i) => i.source)).size,
    };

    return NextResponse.json(briefing);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to build briefing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
