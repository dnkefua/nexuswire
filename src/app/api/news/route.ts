import { NextRequest, NextResponse } from "next/server";
import { aggregateNews } from "@/lib/rss";
import { listArticles, hasPersistedArticles, toNewsItem, upsertArticles } from "@/lib/repositories/articles";
import type { NewsItem, NewsSourceType } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPersistedArticles(options: {
  category?: string;
  type?: NewsSourceType;
  country?: string;
  source?: string;
  q?: string;
  region?: string;
  limit: number;
  offset: number;
}): Promise<NewsItem[] | null> {
  try {
    if (!(await hasPersistedArticles())) return null;

    const stored = await listArticles({
      category: options.category,
      type: options.type,
      country: options.country,
      source: options.source,
      q: options.q,
      limit: options.limit,
      offset: options.offset,
    });

    let items = stored.map(toNewsItem);
    if (options.region) items = items.filter((i) => i.region === options.region);
    return items;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[news] persisted article store unavailable, using live feeds: ${message}`);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") || undefined;
  const type = searchParams.get("type") as NewsSourceType | null;
  const source = searchParams.get("source") || undefined;
  const region = searchParams.get("region") || undefined;
  const country = searchParams.get("country") || undefined;
  const q = searchParams.get("q") || undefined;
  const requestedLimit = Number(searchParams.get("limit") || 40);
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 40;
  const offset = Math.max(Number(searchParams.get("cursor") || 0), 0);
  const normalizedCategory = category === "All" ? undefined : category;

  try {
    const persistedItems = await getPersistedArticles({
      category: normalizedCategory,
      type: type || undefined,
      country,
      source,
      q,
      region,
      limit: limit + 1,
      offset,
    });
    let items =
      persistedItems ||
      (await aggregateNews({
        category: normalizedCategory,
        type: type || undefined,
        source,
        region,
        country,
        q,
        limit: limit + 1,
        offset,
      }));

    const hasSpecificFilter = Boolean(category || type || source || region || country || q);
    if (items.length === 0 && offset === 0 && hasSpecificFilter) {
      items = await aggregateNews({
        category: normalizedCategory,
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
    } else if (!persistedItems && process.env.NODE_ENV === "development" && offset === 0) {
      const all = await aggregateNews({ limit: 200 });
      void upsertArticles(all).catch(() => {});
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
