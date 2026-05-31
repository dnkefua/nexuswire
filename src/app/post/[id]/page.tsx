"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { EngagementBar } from "@/components/EngagementBar";
import { CommentSection } from "@/components/CommentSection";
import type { JournalistPost } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export default function PostPage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<JournalistPost | null>(null);
  const [showComments, setShowComments] = useState(true);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((d) => setPost(d.post || null));
  }, [id]);

  if (!post) {
    return (
      <main>
        <Header title="Post" subtitle="Loading…" />
      </main>
    );
  }

  return (
    <main>
      <Header title="Story" subtitle={post.type} />

      <article className="mx-auto max-w-3xl px-4 py-6">
        <Link
          href={`/journalists/${post.journalistId}`}
          className="text-xs font-bold tracking-widest text-[var(--accent)] uppercase"
        >
          ← Back to desk
        </Link>

        <div className="mt-4 rounded-3xl glass-strong p-6 glow-border">
          <div className="flex flex-wrap gap-2">
            <span className="chip">{post.type}</span>
            <span className="text-[10px] text-[var(--text-muted)]">
              {timeAgo(post.publishedAt)}
            </span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold">{post.title}</h1>
          {post.body && (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-muted)]">
              {post.body}
            </p>
          )}
          {post.embedUrl && (
            <div className="mt-6 aspect-video overflow-hidden rounded-2xl">
              <iframe
                src={post.embedUrl}
                title={post.title}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          )}
          {post.mediaUrl && !post.embedUrl && (
            <a
              href={post.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-[var(--accent)]"
            >
              Open media link →
            </a>
          )}
          <div className="mt-6">
            <EngagementBar
              targetType="post"
              targetId={post.id}
              onCommentClick={() => setShowComments((v) => !v)}
            />
          </div>
          {showComments && (
            <CommentSection targetType="post" targetId={post.id} />
          )}
        </div>
      </article>
    </main>
  );
}
