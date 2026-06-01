import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { AuthError } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

/** Returns { admin, email } for the current request's token. */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    return NextResponse.json({ admin: true, email: user.email });
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ admin: false }, { status });
  }
}
