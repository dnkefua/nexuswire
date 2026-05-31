import { NextRequest, NextResponse } from "next/server";
import { createJournalist, listJournalists } from "@/lib/store";

export async function GET() {
  const journalists = await listJournalists();
  return NextResponse.json({ journalists });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayName, handle, bio, beat, avatarUrl, social } = body;

    if (!displayName?.trim() || !handle?.trim()) {
      return NextResponse.json(
        { error: "Display name and handle are required" },
        { status: 400 }
      );
    }

    const journalist = await createJournalist({
      displayName: String(displayName).trim(),
      handle: String(handle).trim().startsWith("@")
        ? String(handle).trim()
        : `@${String(handle).trim()}`,
      bio: String(bio || "").trim(),
      beat: String(beat || "General").trim(),
      avatarUrl:
        String(avatarUrl || "").trim() ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
      social: social || {},
    });

    return NextResponse.json({ journalist }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
