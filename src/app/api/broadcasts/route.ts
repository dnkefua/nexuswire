import { NextRequest, NextResponse } from "next/server";
import { createBroadcast, listBroadcasts, updateBroadcastStatus } from "@/lib/store";

export async function GET() {
  const broadcasts = await listBroadcasts();
  return NextResponse.json({ broadcasts });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      journalistId,
      title,
      description,
      scheduledAt,
      durationMinutes,
      category,
      streamUrl,
    } = body;

    if (!journalistId || !title?.trim() || !scheduledAt) {
      return NextResponse.json(
        { error: "Journalist, title, and schedule time are required" },
        { status: 400 }
      );
    }

    const broadcast = await createBroadcast({
      journalistId,
      title: String(title).trim(),
      description: String(description || "").trim(),
      scheduledAt: new Date(scheduledAt).toISOString(),
      durationMinutes: Number(durationMinutes) || 30,
      category: String(category || "News").trim(),
      streamUrl: streamUrl ? String(streamUrl).trim() : undefined,
    });

    return NextResponse.json({ broadcast }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to schedule broadcast";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status } = body;
  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }
  const broadcast = await updateBroadcastStatus(id, status);
  if (!broadcast) {
    return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
  }
  return NextResponse.json({ broadcast });
}
