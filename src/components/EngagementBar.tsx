"use client";

import { useEffect, useState } from "react";
import type { EngagementCounts, EngagementTarget } from "@/lib/types";
import { getUserKey, authHeaders } from "@/lib/user-client";
import { useUser } from "@/context/UserContext";

interface EngagementBarProps {
  targetType: EngagementTarget;
  targetId: string;
  onCommentClick?: () => void;
}

export function EngagementBar({
  targetType,
  targetId,
  onCommentClick,
}: EngagementBarProps) {
  const { currentUser, openAuth } = useUser();
  const [engagement, setEngagement] = useState<EngagementCounts>({
    likes: 0,
    comments: 0,
    likedByMe: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({
      targetType,
      targetId,
      userKey: currentUser ? getUserKey() : "guest",
    });
    fetch(`/api/likes?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.engagement) setEngagement(data.engagement);
      });
    return () => {
      ignore = true;
    };
  }, [targetType, targetId, currentUser]);

  async function toggleLike() {
    if (!currentUser) {
      openAuth("login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({
          targetType,
          targetId,
          userKey: getUserKey(),
        }),
      });
      const data = await res.json();
      if (data.engagement) setEngagement(data.engagement);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={loading}
        onClick={toggleLike}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
          engagement.likedByMe
            ? "bg-[var(--danger)]/20 text-[var(--danger)] border border-[var(--danger)]/40"
            : "glass text-[var(--text-muted)] hover:text-[var(--accent)]"
        }`}
      >
        <span>{engagement.likedByMe ? "♥" : "♡"}</span>
        <span>{engagement.likes}</span>
      </button>
      <button
        type="button"
        onClick={onCommentClick}
        className="flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-bold text-[var(--text-muted)] transition-all hover:text-[var(--accent)]"
      >
        <span>💬</span>
        <span>{engagement.comments}</span>
      </button>
    </div>
  );
}
