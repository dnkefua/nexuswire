import { NextRequest, NextResponse } from "next/server";
import { reportComment } from "@/lib/store";
import { REPORT_THRESHOLD } from "@/lib/moderation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit by IP to prevent report spam
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`report:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many reports. Please slow down." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const commentId = body.commentId ? String(body.commentId) : "";
  if (!commentId) {
    return NextResponse.json({ error: "commentId is required" }, { status: 400 });
  }

  const reason = body.reason ? String(body.reason) : "unspecified";

  const result = await reportComment(commentId, REPORT_THRESHOLD);
  if (!result.ok) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  // Persist the report record when Firestore is available
  try {
    const { getFirestoreDb, isFirebaseConfigured } = await import("@/lib/firebase-admin");
    if (isFirebaseConfigured()) {
      await getFirestoreDb().collection("commentReports").add({
        commentId,
        targetType: body.targetType ? String(body.targetType) : null,
        targetId: body.targetId ? String(body.targetId) : null,
        reason,
        createdAt: new Date().toISOString(),
      });
    }
  } catch {
    // non-fatal
  }

  return NextResponse.json({ ok: true, reportCount: result.reportCount });
}
