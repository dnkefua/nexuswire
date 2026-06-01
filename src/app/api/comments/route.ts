import { NextRequest, NextResponse } from "next/server";
import { createComment, listComments } from "@/lib/store";
import { requireUserFromRequest, AuthError } from "@/lib/auth-server";
import { moderateComment } from "@/lib/moderation";
import { rateLimit } from "@/lib/rate-limit";
import type { EngagementTarget } from "@/lib/types";

export async function GET(request: NextRequest) {
  const targetType = request.nextUrl.searchParams.get("targetType") as EngagementTarget;
  const targetId = request.nextUrl.searchParams.get("targetId");
  if (!targetType || !targetId) {
    return NextResponse.json(
      { error: "targetType and targetId required" },
      { status: 400 }
    );
  }
  const comments = await listComments(targetType, targetId);
  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
  try {
    // Verify identity server-side — ignore any client-supplied identity fields.
    const user = await requireUserFromRequest(request);

    // Rate limit: max 5 comments per user per minute
    if (!rateLimit(`comment:${user.uid}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many comments. Please slow down." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { targetType, targetId, body: commentBody } = body;
    if (!targetType || !targetId || !commentBody?.trim()) {
      return NextResponse.json(
        { error: "targetType, targetId, and comment are required" },
        { status: 400 }
      );
    }

    const moderation = moderateComment(String(commentBody));
    if (!moderation.ok) {
      return NextResponse.json({ error: moderation.reason }, { status: 400 });
    }

    const comment = await createComment({
      targetType,
      targetId,
      uid: user.uid,
      authorName: user.displayName || user.email?.split("@")[0] || "User",
      body: String(commentBody).trim(),
    });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = e instanceof Error ? e.message : "Failed to post comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
