import { NextRequest, NextResponse } from "next/server";
import { aggregateNews } from "@/lib/rss";
import { listArticles, hasPersistedArticles, toNewsItem, upsertArticles } from "@/lib/repositories/articles";
import type { NewsItem, NewsSourceType } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") || undefined;
  const type = searchParams.get("type") as NewsSourceType | null;
  const source = searchParams.get("source") || undefined;
  const region = searchParams.get("region") || undefined;
  const country = searchParams.get("country") || undefined;
  const q = searchParams.get("q") || undefined;
  const limit = Math.min(Number(searchParams.get("limit") || 40), 80);
  const offset = Math.max(Number(searchParams.get("cursor") || 0), 0);

  try {
    let items: NewsItem[];

    // Prefer the persisted store (database-backed). Fall back to live
    // aggregation when the store is empty — and in development, seed it once.
    if (await hasPersistedArticles()) {
      const stored = await listArticles({
        category: category === "All" ? undefined : category,
        type: type || undefined,
        country,
        source,
        q,
        limit: limit + 1,
        offset,
      });
      items = stored.map(toNewsItem);
      // region isn't a stored filter dimension; apply it in memory
      if (region) items = items.filter((i) => i.region === region);

      const hasSpecificFilter = Boolean(category || type || source || region || country || q);
      if (items.length === 0 && offset === 0 && hasSpecificFilter) {
        items = await aggregateNews({
          category: category === "All" ? undefined : category,
          type: type || undefined,
          source,
          region,
          country,
          q,
          limit: limit + 1,
          offset,
          force: true,
        });
        void upsertArticles(items).catch(() => {});
      }
    } else {
      items = await aggregateNews({
        category: category === "All" ? undefined : category,
        type: type || undefined,
        source,
        region,
        country,
        q,
        limit: limit + 1,
        offset,
      });
      if (process.env.NODE_ENV === "development" && offset === 0) {
        // Seed the store so subsequent requests are database-backed.
        const all = await aggregateNews({ limit: 200 });
        void upsertArticles(all).catch(() => {});
      }
    }

    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? String(offset + limit) : null;

    return NextResponse.json({ items: page, count: page.length, nextCursor });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch news";
    return NextResponse.json({ error: message, items: [] }, { status: 500 });
  }
}
