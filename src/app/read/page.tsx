"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { EngagementBar } from "@/components/EngagementBar";
import { CommentSection } from "@/components/CommentSection";
import { timeAgo } from "@/lib/utils";

function ReaderContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const title = searchParams.get("title") || "";
  const summary = searchParams.get("summary") || "";
  const image = searchParams.get("image") || "";
  const source = searchParams.get("source") || "";
  const link = searchParams.get("link") || "";
  const publishedAt = searchParams.get("publishedAt") || "";

  const [showComments, setShowComments] = useState(true);

  if (!id || !title) {
    return (
      <div className="flex h-60 items-center justify-center">
        <p className="text-[var(--text-muted)]">No article selected.</p>
      </div>
    );
  }

  const decodedTitle = decodeURIComponent(title);
  const decodedSummary = decodeURIComponent(summary);
  const decodedSource = decodeURIComponent(source);
  const decodedLink = decodeURIComponent(link);
  const decodedImage = image ? decodeURIComponent(image) : null;
  const decodedPublished = publishedAt ? decodeURIComponent(publishedAt) : new Date().toISOString();

  return (
    <article className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/"
        className="text-xs font-bold tracking-widest text-[var(--accent)] uppercase hover:text-[var(--accent-hover)] transition-colors"
      >
        ← Back to wire
      </Link>

      <div className="mt-4 overflow-hidden rounded-3xl glass-strong p-6 glow-border fade-up">
        {decodedImage && (
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl bg-black/40">
            <Image
              src={decodedImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030508]/80 via-transparent to-transparent" />
          </div>
        )}

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip chip-blog">{decodedSource}</span>
            <span className="text-[10px] text-[var(--text-muted)]">
              {timeAgo(decodedPublished)}
            </span>
          </div>

          <h1 className="mt-4 font-display text-2xl md:text-3xl font-bold leading-tight text-[var(--text-primary)]">
            {decodedTitle}
          </h1>

          <div className="mt-6 border-l-2 border-[var(--accent)] pl-4 text-sm md:text-base leading-relaxed text-[var(--text-muted)]">
            {decodedSummary}
          </div>

          <div className="mt-8 text-center">
            <a
              href={decodedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold tracking-wide uppercase transition-all hover:scale-102"
            >
              Read full story at {decodedSource} →
            </a>
          </div>

          <div className="mt-8 border-t border-[var(--border)] pt-6">
            <EngagementBar
              targetType="article"
              targetId={id}
              onCommentClick={() => setShowComments((v) => !v)}
            />
            {showComments && (
              <div className="mt-6">
                <CommentSection targetType="article" targetId={id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ReaderPage() {
  return (
    <main>
      <Header title="Reader" subtitle="In-App Newsroom" />
      <Suspense fallback={
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="h-96 animate-pulse rounded-3xl glass" />
        </div>
      }>
        <ReaderContent />
      </Suspense>
    </main>
  );
}
