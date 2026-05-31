import { NextRequest, NextResponse } from "next/server";
import {
  getJournalist,
  listConnectedSources,
  listPosts,
  updateJournalist,
} from "@/lib/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const journalist = await getJournalist(id);
  if (!journalist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [posts, sources] = await Promise.all([
    listPosts(id),
    listConnectedSources(id),
  ]);
  return NextResponse.json({ journalist, posts, sources });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const journalist = await updateJournalist(id, {
      bio: body.bio,
      beat: body.beat,
      avatarUrl: body.avatarUrl,
      social: body.social,
    });
    if (!journalist) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ journalist });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
