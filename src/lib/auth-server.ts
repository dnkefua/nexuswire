import "server-only";
import type { NextRequest } from "next/server";
import { isFirebaseConfigured, getFirebaseAdmin } from "./firebase-admin";

export interface VerifiedUser {
  uid: string;
  email?: string;
  displayName?: string;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/**
 * Verifies the Firebase ID token from the Authorization header.
 * Throws AuthError(401) if missing or invalid.
 *
 * In development without Firebase Admin configured, falls back to a
 * dev-only identity so local testing works. This fallback NEVER runs in
 * production — there, a missing/invalid token is always rejected.
 */
export async function requireUserFromRequest(
  request: NextRequest
): Promise<VerifiedUser> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!isFirebaseConfigured()) {
    if (process.env.NODE_ENV === "development") {
      // Dev-only identity — clearly not production auth.
      return { uid: "dev-user", email: "dev@nexuswire.local", displayName: "Dev User" };
    }
    throw new AuthError("Authentication is not configured", 503);
  }

  if (!token) {
    throw new AuthError("Missing authentication token", 401);
  }

  try {
    const { getAuth } = await import("firebase-admin/auth");
    const decoded = await getAuth(getFirebaseAdmin()).verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name || (decoded.email ? decoded.email.split("@")[0] : undefined),
    };
  } catch {
    throw new AuthError("Invalid or expired authentication token", 401);
  }
}

/** Returns the verified user or null without throwing (for optional auth). */
export async function getUserFromRequest(
  request: NextRequest
): Promise<VerifiedUser | null> {
  try {
    return await requireUserFromRequest(request);
  } catch {
    return null;
  }
}
