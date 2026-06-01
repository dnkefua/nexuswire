import { NextRequest, NextResponse } from "next/server";
import { aggregateNews } from "@/lib/rss";
import { clusterStories } from "@/lib/clustering";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") || undefined;
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") || 12), 30);

  try {
    const items = await aggregateNews({
      category: category && category !== "All" ? category : undefined,
      limit: 120,
    });
    const clusters = clusterStories(items).slice(0, limit);
    return NextResponse.json({ clusters, count: clusters.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to build clusters";
    return NextResponse.json({ error: message, clusters: [] }, { status: 500 });
  }
}
