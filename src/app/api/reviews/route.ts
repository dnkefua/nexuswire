import { NextRequest, NextResponse } from "next/server";
import { createReview, listReviews } from "@/lib/store";
import type { ReviewType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") as ReviewType | null;
  const reviews = await listReviews(type || undefined);
  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authorName, type, subject, rating, body: reviewBody, mediaUrl } = body;
    if (!authorName?.trim() || !type || !subject?.trim() || !reviewBody?.trim()) {
      return NextResponse.json(
        { error: "Name, type, subject, and review text are required" },
        { status: 400 }
      );
    }
    const review = await createReview({
      authorName: String(authorName).trim(),
      type,
      subject: String(subject).trim(),
      rating: Number(rating) || 5,
      body: String(reviewBody).trim(),
      mediaUrl: mediaUrl ? String(mediaUrl).trim() : undefined,
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
