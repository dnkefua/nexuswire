import { NextRequest, NextResponse } from "next/server";
import { getEngagement, toggleLike } from "@/lib/store";
import { getUserFromRequest } from "@/lib/auth-server";
import { rateLimit } from "@/lib/rate-limit";
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
  // Prefer verified identity when a token is present
  const user = await getUserFromRequest(request);
  const resolvedKey = user ? `uid:${user.uid}` : userKey;
  const engagement = await getEngagement(targetType, targetId, resolvedKey);
  return NextResponse.json({ engagement });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetType, targetId, userKey } = body;
    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "targetType and targetId required" },
        { status: 400 }
      );
    }

    // Prefer the verified Firebase uid; fall back to client key only when no token.
    const user = await getUserFromRequest(request);
    const resolvedKey = user ? `uid:${user.uid}` : userKey;
    if (!resolvedKey) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!rateLimit(`like:${resolvedKey}`, 30, 60_000)) {
      return NextResponse.json({ error: "Too many actions. Please slow down." }, { status: 429 });
    }

    const engagement = await toggleLike(targetType, targetId, resolvedKey);
    return NextResponse.json({ engagement });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Like failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
