"use client";

import Image from "next/image";
import type { NewsItem } from "@/lib/types";
import { timeAgo, cn } from "@/lib/utils";
import { SourceBadge } from "./SourceBadge";

interface NewsCardProps {
  item: NewsItem;
  featured?: boolean;
  index?: number;
}

export function NewsCard({ item, featured, index = 0 }: NewsCardProps) {
  const isVideo = item.sourceType === "youtube";
  const isBlogOrRss = item.sourceType === "blog" || item.sourceType === "rss";

  let href = item.link;
  let target: string | undefined = "_blank";
  let rel: string | undefined = "noopener noreferrer";

  if (isVideo) {
    href = `/live?v=${item.videoId}&title=${encodeURIComponent(item.title)}&source=${encodeURIComponent(item.source)}&summary=${encodeURIComponent(item.summary || "")}`;
    target = undefined;
    rel = undefined;
  } else if (isBlogOrRss) {
    const params = new URLSearchParams({
      id: item.id,
      title: item.title,
      summary: item.summary || "",
      image: item.image || "",
      source: item.source,
      link: item.link,
      publishedAt: item.publishedAt,
      sourceType: item.sourceType,
      category: item.category,
      region: item.region || "",
      country: item.country || "",
    });
    href = `/read?${params}`;
    target = undefined;
    rel = undefined;
  }

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={cn(
        "group block overflow-hidden rounded-2xl glass transition-all hover:glow-border fade-up",
        featured ? "col-span-full" : ""
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {item.image && (
        <div
          className={cn(
            "relative overflow-hidden bg-black/40",
            featured ? "aspect-[21/9]" : "aspect-video"
          )}
        >
          <Image
            src={item.image}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={featured ? "100vw" : "400px"}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030508] via-transparent to-transparent" />
          {item.isLive && (
            <span className="absolute top-3 left-3 chip chip-live flex items-center gap-1.5">
              <span className="live-dot h-1.5 w-1.5 rounded-full" />
              Video Feed
            </span>
          )}
          {/* Preview badge overlay */}
          {isBlogOrRss && (
            <span className="absolute bottom-3 right-3 text-[9px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-sm text-[var(--gold)] px-2 py-1 rounded-md border border-[var(--gold)]/30">
              Preview
            </span>
          )}
        </div>
      )}
      <div className={cn("p-4", !item.image && "pt-5")}>
        <div className="mb-2">
          <SourceBadge type={item.sourceType} />
        </div>
        <h3
          className={cn(
            "font-semibold leading-snug text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors",
            featured ? "text-xl md:text-2xl" : "text-sm md:text-base line-clamp-3"
          )}
        >
          {item.title}
        </h3>
        {featured && item.summary && (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">
            {item.summary}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
          <span className="font-medium text-[var(--accent-dim)]">{item.source}</span>
          <span>·</span>
          <span>{timeAgo(item.publishedAt)}</span>
          {item.country && item.country !== "Global" && (
            <>
              <span>·</span>
              <span className="text-[var(--text-muted)]/60">{item.country} publisher</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}
