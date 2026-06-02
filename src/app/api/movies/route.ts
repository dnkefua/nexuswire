import { NextResponse } from "next/server";
import { aggregateMovies } from "@/lib/movies";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || 120);
  const q = searchParams.get("q") || undefined;
  const platformParam = searchParams.get("platform");
  const platform =
    platformParam === "web" || platformParam === "youtube" ? platformParam : "all";

  try {
    const items = await aggregateMovies({ limit, q, platform });
    return NextResponse.json({
      count: items.length,
      items,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[movies] aggregation failed", error);
    return NextResponse.json(
      { error: "Unable to aggregate free movies", items: [], count: 0 },
      { status: 500 }
    );
  }
}
