"use client";

import { useEffect, useState } from "react";
import type { Comment, EngagementTarget } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { setUserDisplayName } from "@/lib/user-client";
import { useUser } from "@/context/UserContext";

interface CommentSectionProps {
  targetType: EngagementTarget;
  targetId: string;
}

export function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const { currentUser, openAuth } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({ targetType, targetId });
    fetch(`/api/comments?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setComments(data.comments || []);
      });
    return () => {
      ignore = true;
    };
  }, [targetType, targetId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !body.trim() || !currentUser.username) return;
    setSaving(true);
    try {
      setUserDisplayName(currentUser.username);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          authorName: currentUser.username,
          body,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setBody("");
      const params = new URLSearchParams({ targetType, targetId });
      const refreshed = await fetch(`/api/comments?${params}`);
      const refreshedData = await refreshed.json();
      setComments(refreshedData.comments || []);
    } catch {
      alert("Could not post comment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 border-t border-[var(--border)] pt-4">
      <h4 className="mb-3 text-[10px] font-bold tracking-widest text-[var(--gold)] uppercase">
        Comments
      </h4>
      
      {!currentUser ? (
        <div className="mb-4 rounded-xl border border-[var(--border)] bg-black/20 p-4 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            You must be logged in to participate in the conversation.
          </p>
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="mt-2 text-xs font-bold text-[var(--accent)] hover:underline uppercase tracking-wider"
          >
            Sign In / Register
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-4 space-y-2">
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">
            Commenting as <span className="text-[var(--gold)]">{currentUser.username}</span>
          </div>
          <textarea
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your take…"
            required
          />
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Posting…" : "Post Comment"}
          </button>
        </form>
      )}
      <ul className="space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">No comments yet. Be the first.</p>
        )}
        {comments.map((c) => (
          <li key={c.id} className="rounded-xl glass p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[var(--accent)]">{c.authorName}</span>
              <span className="text-[10px] text-[var(--text-muted)]">
                {timeAgo(c.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--text-primary)]">{c.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
