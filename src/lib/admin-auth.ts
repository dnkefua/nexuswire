import "server-only";
import type { NextRequest } from "next/server";
import { requireUserFromRequest, AuthError, type VerifiedUser } from "./auth-server";
import { isFirebaseConfigured } from "./firebase-admin";

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const allow = getAdminEmails();
  // If no allowlist is configured, no one is admin in production.
  if (allow.length === 0) return false;
  return allow.includes(email.toLowerCase());
}

/**
 * Verify the request comes from an admin. Throws AuthError otherwise.
 *
 * Dev convenience: when Firebase Admin is not configured (local dev), the
 * dev-only identity is treated as admin so the dashboard is usable. This NEVER
 * applies in production — there an ADMIN_EMAILS match against a verified token
 * is required.
 */
export async function requireAdmin(request: NextRequest): Promise<VerifiedUser> {
  if (!isFirebaseConfigured() && process.env.NODE_ENV === "development") {
    return { uid: "dev-admin", email: "dev@nexuswire.local", displayName: "Dev Admin" };
  }

  const user = await requireUserFromRequest(request);
  if (!isAdminEmail(user.email)) {
    throw new AuthError("Admin access required", 403);
  }
  return user;
}
