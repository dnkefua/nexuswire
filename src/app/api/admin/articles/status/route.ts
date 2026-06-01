import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { AuthError } from "@/lib/auth-server";
import { setArticleStatus } from "@/lib/repositories/articles";
import type { NormalizedArticle } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID: NormalizedArticle["status"][] = ["active", "hidden", "reported", "removed"];

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = (await request.json()) as { id?: string; status?: string };
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }
    if (!VALID.includes(body.status as NormalizedArticle["status"])) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const ok = await setArticleStatus(body.id, body.status as NormalizedArticle["status"]);
    if (!ok) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    return NextResponse.json({ ok: true, id: body.id, status: body.status });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = e instanceof Error ? e.message : "Failed to update status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
