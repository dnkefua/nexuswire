import { NextRequest, NextResponse } from "next/server";
import { searchNews } from "@/lib/search";
import type { SearchFacet } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_FACETS: SearchFacet[] = [
  "all",
  "videos",
  "newspaper",
  "blogs",
  "countries",
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") || "";
  const facetParam = searchParams.get("facet") || "all";
  const country = searchParams.get("country") || "";
  const limit = Math.min(Number(searchParams.get("limit") || 40), 80);

  const facet = VALID_FACETS.includes(facetParam as SearchFacet)
    ? (facetParam as SearchFacet)
    : "all";

  try {
    const { items, total } = await searchNews({ query, facet, country, limit });
    return NextResponse.json({ items, total, query, facet, country });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Search failed";
    return NextResponse.json(
      { error: message, items: [], total: 0 },
      { status: 500 }
    );
  }
}
