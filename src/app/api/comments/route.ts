import { NextRequest, NextResponse } from "next/server";
import { createComment, listComments } from "@/lib/store";
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
    const body = await request.json();
    const { targetType, targetId, authorName, body: commentBody } = body;
    if (!targetType || !targetId || !authorName?.trim() || !commentBody?.trim()) {
      return NextResponse.json(
        { error: "targetType, targetId, name, and comment are required" },
        { status: 400 }
      );
    }
    const comment = await createComment({
      targetType,
      targetId,
      authorName: String(authorName).trim(),
      body: String(commentBody).trim(),
    });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to post comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
