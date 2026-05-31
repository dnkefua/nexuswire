import { NextRequest, NextResponse } from "next/server";
import {
  addConnectedSource,
  listConnectedSources,
  removeConnectedSource,
} from "@/lib/store";
import type { ConnectedPlatform } from "@/lib/types";

export async function GET(request: NextRequest) {
  const journalistId = request.nextUrl.searchParams.get("journalistId");
  if (!journalistId) {
    return NextResponse.json({ error: "journalistId required" }, { status: 400 });
  }
  const sources = await listConnectedSources(journalistId);
  return NextResponse.json({ sources });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { journalistId, platform, label, url } = body;
    if (!journalistId || !platform || !url?.trim()) {
      return NextResponse.json(
        { error: "journalistId, platform, and url are required" },
        { status: 400 }
      );
    }
    const source = await addConnectedSource({
      journalistId,
      platform: platform as ConnectedPlatform,
      label: String(label || platform).trim(),
      url: String(url).trim(),
    });
    return NextResponse.json({ source }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to add source";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const ok = await removeConnectedSource(id);
  if (!ok) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
