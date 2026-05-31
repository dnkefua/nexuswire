import { NextRequest, NextResponse } from "next/server";
import { aggregateNews } from "@/lib/rss";
import type { NewsSourceType } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") || undefined;
  const type = searchParams.get("type") as NewsSourceType | null;
  const limit = Math.min(Number(searchParams.get("limit") || 40), 80);

  try {
    const items = await aggregateNews({
      category: category === "All" ? undefined : category,
      type: type || undefined,
      limit,
    });
    return NextResponse.json({ items, count: items.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch news";
    return NextResponse.json({ error: message, items: [] }, { status: 500 });
  }
}
