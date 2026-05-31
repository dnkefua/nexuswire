"use client";

import { useEffect, useState } from "react";
import type { Comment, EngagementTarget } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { getUserDisplayName, setUserDisplayName } from "@/lib/user-client";

interface CommentSectionProps {
  targetType: EngagementTarget;
  targetId: string;
}

export function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState(() =>
    typeof window !== "undefined" ? getUserDisplayName() : ""
  );
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
    if (!body.trim() || !authorName.trim()) return;
    setSaving(true);
    try {
      setUserDisplayName(authorName);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          authorName,
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
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name"
          required
        />
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
