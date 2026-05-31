import { NextRequest, NextResponse } from "next/server";
import { getEngagement, toggleLike } from "@/lib/store";
import type { EngagementTarget } from "@/lib/types";

export async function GET(request: NextRequest) {
  const targetType = request.nextUrl.searchParams.get("targetType") as EngagementTarget;
  const targetId = request.nextUrl.searchParams.get("targetId");
  const userKey = request.nextUrl.searchParams.get("userKey") || undefined;
  if (!targetType || !targetId) {
    return NextResponse.json(
      { error: "targetType and targetId required" },
      { status: 400 }
    );
  }
  const engagement = await getEngagement(targetType, targetId, userKey);
  return NextResponse.json({ engagement });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetType, targetId, userKey } = body;
    if (!targetType || !targetId || !userKey) {
      return NextResponse.json(
        { error: "targetType, targetId, and userKey required" },
        { status: 400 }
      );
    }
    const engagement = await toggleLike(targetType, targetId, userKey);
    return NextResponse.json({ engagement });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Like failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
