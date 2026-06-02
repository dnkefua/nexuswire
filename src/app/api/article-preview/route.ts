import { NextRequest, NextResponse } from "next/server";
import { fetchArticleExcerpt } from "@/lib/extract";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const requestedFraction = Number(request.nextUrl.searchParams.get("fraction") || 0.5);
  const fraction = requestedFraction >= 0.75 ? 0.75 : 0.5;
  if (!url) {
    return NextResponse.json({ ok: false, error: "url required" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`preview:${ip}`, 30, 60_000)) {
    return NextResponse.json({ ok: false, error: "rate-limited" }, { status: 429 });
  }

  const excerpt = await fetchArticleExcerpt(url, fraction);
  return NextResponse.json(excerpt);
}
