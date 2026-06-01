import { NextRequest, NextResponse } from "next/server";
import { enrichArticle, isAiConfigured } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";
import type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAiConfigured()) {
    // Graceful: tell the client AI is unavailable rather than erroring.
    return NextResponse.json({ enrichment: null, aiAvailable: false });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`enrich:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: Partial<NewsItem>;
  try {
    body = (await request.json()) as Partial<NewsItem>;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.title || !body.link) {
    return NextResponse.json({ error: "title and link are required" }, { status: 400 });
  }

  const enrichment = await enrichArticle({
    id: body.id || "",
    title: body.title,
    summary: body.summary || "",
    link: body.link,
    source: body.source || "the original publisher",
    sourceType: body.sourceType || "rss",
    category: body.category || "Top Stories",
    region: body.region || "",
    country: body.country || "",
    publishedAt: body.publishedAt || new Date().toISOString(),
  });

  return NextResponse.json({ enrichment, aiAvailable: true });
}
