"use client";

import Image from "next/image";
import type { NewsItem } from "@/lib/types";
import { timeAgo, cn } from "@/lib/utils";

interface NewsCardProps {
  item: NewsItem;
  featured?: boolean;
  index?: number;
}

function typeChip(type: NewsItem["sourceType"]) {
  if (type === "youtube") return "chip-youtube";
  if (type === "blog") return "chip-blog";
  return "chip-rss";
}

export function NewsCard({ item, featured, index = 0 }: NewsCardProps) {
  const href = item.videoId
    ? `https://www.youtube.com/watch?v=${item.videoId}`
    : item.link;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
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
        </div>
      )}
      <div className={cn("p-4", !item.image && "pt-5")}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={cn("chip", typeChip(item.sourceType))}>
            {item.sourceType}
          </span>
          <span className="chip">{item.category}</span>
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
        <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
          <span className="font-medium text-[var(--accent-dim)]">{item.source}</span>
          <span>·</span>
          <span>{timeAgo(item.publishedAt)}</span>
        </div>
      </div>
    </a>
  );
}
