import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_FEEDS } from "@/lib/feeds";
import { fetchAllFeeds, getSourceHealth } from "@/lib/rss";
import { upsertArticles } from "@/lib/repositories/articles";
import { saveSourceHealth } from "@/lib/repositories/sources";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled ingestion endpoint. Fetches all active sources, persists articles
 * one-document-per-article, refreshes source health, and returns a summary.
 *
 * Auth: Authorization: Bearer ${CRON_SECRET | NEWS_INGEST_SECRET}
 * In development, runs without a secret when none is configured (dev-only).
 */
async function runIngestion() {
  const items = await fetchAllFeeds(8);
  const { created, updated } = await upsertArticles(items);

  const health = getSourceHealth();
  const sourcesFailed = health.filter((h) => !h.lastSuccessfulFetchAt).length;

  try {
    await saveSourceHealth(health);
  } catch (e) {
    console.warn("[cron] source health persist failed:", e);
  }

  return {
    sourcesChecked: DEFAULT_FEEDS.length,
    articlesCreated: created,
    articlesUpdated: updated,
    sourcesFailed,
    ranAt: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET || process.env.NEWS_INGEST_SECRET;
  const auth = request.headers.get("authorization") || "";

  if (secret) {
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "CRON_SECRET / NEWS_INGEST_SECRET is not configured" },
      { status: 503 }
    );
  }

  const summary = await runIngestion();
  return NextResponse.json(summary);
}

// Allow admin UI / dev tools to trigger ingestion via POST as well.
export const POST = GET;
