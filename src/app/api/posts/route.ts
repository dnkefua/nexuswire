import { NextRequest, NextResponse } from "next/server";
import { createPost, listPosts } from "@/lib/store";

export async function GET(request: NextRequest) {
  const journalistId = request.nextUrl.searchParams.get("journalistId") || undefined;
  const posts = await listPosts(journalistId);
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { journalistId, type, title, body: postBody, mediaUrl, tags } = body;
    if (!journalistId || !type || !title?.trim()) {
      return NextResponse.json(
        { error: "Journalist, type, and title are required" },
        { status: 400 }
      );
    }
    const post = await createPost({
      journalistId,
      type,
      title: String(title).trim(),
      body: String(postBody || "").trim(),
      mediaUrl: mediaUrl ? String(mediaUrl).trim() : undefined,
      tags: Array.isArray(tags) ? tags.map(String) : [],
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
