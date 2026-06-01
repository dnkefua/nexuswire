import "server-only";

// Placeholder spam/abuse word list. Expand or replace with a real service later.
const BLOCKED_PATTERNS = [
  /\b(viagra|cialis)\b/i,
  /\b(buy now|click here|free money)\b/i,
  /(https?:\/\/[^\s]+){4,}/i, // 4+ links = likely spam
];

export interface ModerationResult {
  ok: boolean;
  reason?: string;
}

export function moderateComment(body: string): ModerationResult {
  const trimmed = body.trim();
  if (trimmed.length < 2) {
    return { ok: false, reason: "Comment is too short" };
  }
  if (trimmed.length > 2000) {
    return { ok: false, reason: "Comment is too long (max 2000 characters)" };
  }
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { ok: false, reason: "Comment flagged as spam or abusive" };
    }
  }
  return { ok: true };
}

/** Comment report threshold after which a comment is auto-flagged. */
export const REPORT_THRESHOLD = 3;
