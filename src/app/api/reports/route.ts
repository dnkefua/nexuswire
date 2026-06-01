import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { url, reason } = body;
  if (!url || !reason) {
    return NextResponse.json({ error: "url and reason are required" }, { status: 400 });
  }

  const report = {
    url: String(url),
    title: body.title ? String(body.title) : null,
    source: body.source ? String(body.source) : null,
    reason: String(reason),
    email: body.email ? String(body.email) : null,
    details: body.details ? String(body.details) : null,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  try {
    const { getFirestoreDb, isFirebaseConfigured } = await import("@/lib/firebase-admin");
    if (isFirebaseConfigured()) {
      const db = getFirestoreDb();
      await db.collection("reports").add(report);
      return NextResponse.json({ ok: true });
    }
  } catch {
    // fall through
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[DEV] Report submitted:", report);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Report storage unavailable" }, { status: 503 });
}
