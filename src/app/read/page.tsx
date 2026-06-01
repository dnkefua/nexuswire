"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { EngagementBar } from "@/components/EngagementBar";
import { CommentSection } from "@/components/CommentSection";
import { SourceTransparencyCard } from "@/components/SourceTransparencyCard";
import { StoryActions } from "@/components/StoryActions";
import { SourceBadge } from "@/components/SourceBadge";
import { AiInsights } from "@/components/AiInsights";
import { ArticleExcerpt } from "@/components/ArticleExcerpt";
import { timeAgo } from "@/lib/utils";
import type { NewsItem } from "@/lib/types";

function ReaderContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const title = searchParams.get("title") || "";
  const summary = searchParams.get("summary") || "";
  const image = searchParams.get("image") || "";
  const source = searchParams.get("source") || "";
  const link = searchParams.get("link") || "";
  const publishedAt = searchParams.get("publishedAt") || "";
  const sourceType = (searchParams.get("sourceType") as NewsItem["sourceType"]) || "rss";
  const category = searchParams.get("category") || "World";
  const region = searchParams.get("region") || "";
  const country = searchParams.get("country") || "";

  const [showComments, setShowComments] = useState(false);

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
  const decodedRegion = region ? decodeURIComponent(region) : undefined;
  const decodedCountry = country ? decodeURIComponent(country) : undefined;

  const storyItem = {
    id,
    title: decodedTitle,
    summary: decodedSummary,
    link: decodedLink,
    source: decodedSource,
    image: decodedImage || undefined,
    publishedAt: decodedPublished,
    sourceType,
    category,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 space-y-5">
      <Link
        href="/"
        className="text-xs font-bold tracking-widest text-[var(--accent)] uppercase hover:text-[var(--accent-hover)] transition-colors"
      >
        ← Back to wire
      </Link>

      {/* Legal preview notice */}
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
        Source-attributed preview · Full article belongs to {decodedSource}
      </div>

      <div className="overflow-hidden rounded-3xl glass-strong p-6 glow-border fade-up space-y-5">
        {decodedImage && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black/40">
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

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge type={sourceType} trusted preview />
            <span className="chip">{category}</span>
            <span className="text-[10px] text-[var(--text-muted)]">
              {timeAgo(decodedPublished)}
            </span>
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight text-[var(--text-primary)]">
            {decodedTitle}
          </h1>

          <div className="text-xs text-[var(--text-muted)] font-medium">
            By <span className="text-[var(--accent)]">{decodedSource}</span>
          </div>
        </div>

        {/* Extended preview (~25% of the article) with continue-reading CTA.
            Falls back to the RSS summary when extraction is unavailable. */}
        <ArticleExcerpt url={decodedLink} source={decodedSource} fallbackSummary={decodedSummary} />

        {/* AI-generated context (graceful when no key configured) */}
        <AiInsights item={storyItem} />

        {/* Primary CTA */}
        <div className="text-center">
          <a
            href={decodedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 rounded-full px-8 py-3"
          >
            Read full story at {decodedSource} →
          </a>
          <p className="mt-2 text-[10px] text-[var(--text-muted)]">
            Opens on the original publisher&apos;s website
          </p>
        </div>

        {/* Story Actions */}
        <div className="border-t border-[var(--border)] pt-4">
          <StoryActions item={storyItem} />
        </div>

        {/* Engagement */}
        <div className="border-t border-[var(--border)] pt-4">
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

      {/* Source Transparency */}
      <SourceTransparencyCard
        item={{
          id,
          title: decodedTitle,
          summary: decodedSummary,
          link: decodedLink,
          source: decodedSource,
          sourceType,
          category,
          region: decodedRegion,
          country: decodedCountry,
          publishedAt: decodedPublished,
        }}
      />

      {/* Legal footer */}
      <div className="rounded-xl border border-[var(--border)] p-4 text-[10px] text-[var(--text-muted)] text-center">
        Preview by NexusWire. Full article belongs to{" "}
        <a href={decodedLink} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
          {decodedSource}
        </a>
        . NexusWire is a news aggregation platform and does not claim ownership of third-party content.
      </div>
    </article>
  );
}

export default function ReaderPage() {
  return (
    <main>
      <Header title="Reader" subtitle="Source-Attributed Preview" />
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
