"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type MoviePlatform = "Web" | "YouTube" | "TikTok";

type MovieItem = {
  id: string;
  title: string;
  year: string;
  platform: MoviePlatform;
  source: string;
  genre: string;
  runtime: string;
  rights: string;
  description: string;
  poster: string;
  embedUrl: string;
  sourceUrl: string;
  videoId?: string;
  publishedAt?: string;
};

const filters: Array<"all" | "web" | "youtube"> = ["all", "youtube", "web"];

const discoveryLinks = [
  {
    label: "YouTube Movies free catalog",
    href: "https://www.youtube.com/movies",
    source: "YouTube",
  },
];

function platformClasses(platform: MoviePlatform): string {
  if (platform === "YouTube") return "border-red-400/30 bg-red-500/10 text-red-100";
  if (platform === "TikTok") return "border-cyan-300/30 bg-cyan-400/10 text-cyan-100";
  return "border-[var(--gold)]/35 bg-[var(--gold)]/10 text-[var(--gold-bright)]";
}

function extractTikTokVideoId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/) || url.match(/[?&](?:video_id|item_id)=(\d+)/);
  return match?.[1] || null;
}

function emptyMovie(): MovieItem {
  return {
    id: "empty",
    title: "Free Movies",
    year: "Now",
    platform: "Web",
    source: "NexusWire",
    genre: "Movies",
    runtime: "Full movie",
    rights: "Legal sources",
    description: "Loading free movies from legal YouTube and web archive sources.",
    poster: "https://archive.org/services/img/TheGeneral",
    embedUrl: "about:blank",
    sourceUrl: "https://www.youtube.com/movies",
  };
}

export function MovieWatchRoom() {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const [filter, setFilter] = useState<"all" | "web" | "youtube">("all");
  const [query, setQuery] = useState("");
  const [tikTokUrl, setTikTokUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tikTokError, setTikTokError] = useState("");
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      limit: "180",
      platform: filter,
    });
    if (query.trim()) params.set("q", query.trim());

    queueMicrotask(() => {
      setLoading(true);
      setError(false);
    });
    fetch(`/api/movies?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Movies API ${res.status}`);
        return res.json();
      })
      .then((data: { items?: MovieItem[] }) => {
        const nextMovies = data.items || [];
        setMovies(nextMovies);
        setActiveId((current) =>
          nextMovies.some((movie) => movie.id === current) ? current : nextMovies[0]?.id || ""
        );
      })
      .catch((nextError) => {
        if ((nextError as Error).name !== "AbortError") {
          setError(true);
          setMovies([]);
          setActiveId("");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [filter, query]);

  const active = useMemo(
    () => movies.find((movie) => movie.id === activeId) || movies[0] || emptyMovie(),
    [activeId, movies]
  );

  function playMovie(movie: MovieItem) {
    setActiveId(movie.id);
    window.requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function playTikTokUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const videoId = extractTikTokVideoId(tikTokUrl.trim());
    if (!videoId) {
      setTikTokError("Paste a TikTok video URL that contains /video/...");
      return;
    }

    const tikTokMovie: MovieItem = {
      id: `tiktok-${videoId}`,
      title: "TikTok movie clip",
      year: "TikTok",
      platform: "TikTok",
      source: "TikTok",
      genre: "Short-form",
      runtime: "Clip",
      rights: "Verify creator rights",
      description:
        "TikTok movie or public-domain clip opened inside NexusWire through TikTok's official player.",
      poster: "https://archive.org/services/img/TheGeneral",
      embedUrl: `https://www.tiktok.com/player/v1/${videoId}`,
      sourceUrl: tikTokUrl.trim(),
    };

    setTikTokError("");
    setMovies((current) => [tikTokMovie, ...current.filter((movie) => movie.id !== tikTokMovie.id)]);
    setActiveId(tikTokMovie.id);
    window.requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 pb-28">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div ref={playerRef} className="overflow-hidden rounded-2xl glow-border scroll-mt-24">
          <div className="relative aspect-video bg-black">
            {active.embedUrl === "about:blank" ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--text-muted)]">
                Loading movie player...
              </div>
            ) : (
              <iframe
                key={active.id}
                title={active.title}
                src={active.embedUrl}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="eager"
              />
            )}
          </div>
          <div className="glass-strong p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${platformClasses(
                  active.platform
                )}`}
              >
                {active.platform}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                {active.source}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                {active.year} - {active.runtime}
              </span>
            </div>
            <h2 className="mt-3 font-display text-xl font-bold uppercase tracking-[0.1em] text-[var(--text-primary)] sm:text-2xl">
              {active.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              {active.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest">
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[var(--text-muted)]">
                {active.genre}
              </span>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[var(--text-muted)]">
                {active.rights}
              </span>
              <a
                href={active.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[var(--accent)]/40 px-3 py-1 text-[var(--accent)] hover:bg-[var(--accent)]/10"
              >
                Source
              </a>
            </div>
          </div>
        </div>

        <aside className="glass rounded-2xl p-5">
          <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold-bright)]">
            Movie aggregator
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            Aggregating full free movies from legal YouTube channels and public web archives.
            Click any poster to play it inside NexusWire.
          </p>
          <div className="mt-5">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search action, comedy, drama..."
              aria-label="Search free movies"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {filters.map((nextFilter) => (
              <button
                key={nextFilter}
                type="button"
                onClick={() => setFilter(nextFilter)}
                className={`rounded-xl border px-2 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                  filter === nextFilter
                    ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                    : "border-[var(--border)] bg-black/20 text-[var(--text-muted)] hover:border-[var(--accent)]"
                }`}
              >
                {nextFilter}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-black/20 p-3 text-[10px] leading-5 text-[var(--text-muted)]">
            YouTube Movies&apos; official free-with-ads shelf can rotate by region and may
            not expose every title through embeds, so NexusWire also indexes licensed
            full-movie channels that provide standard YouTube players.
          </div>
          <form onSubmit={playTikTokUrl} className="mt-3 rounded-xl border border-cyan-300/20 bg-cyan-400/5 p-3">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-cyan-100">
              Open TikTok in app
            </label>
            <input
              type="url"
              value={tikTokUrl}
              onChange={(event) => {
                setTikTokUrl(event.target.value);
                setTikTokError("");
              }}
              placeholder="https://www.tiktok.com/@creator/video/..."
              aria-label="TikTok movie clip URL"
              className="mt-2"
            />
            {tikTokError && (
              <p className="mt-2 text-[10px] font-semibold text-[var(--danger)]">
                {tikTokError}
              </p>
            )}
            <button
              type="submit"
              className="mt-2 inline-flex h-9 items-center rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-3 text-[10px] font-bold uppercase tracking-widest text-cyan-100 transition-colors hover:bg-cyan-300/20"
            >
              Play TikTok
            </button>
          </form>
          <div className="mt-3 space-y-2">
            {discoveryLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-[var(--border)] bg-black/20 p-3 transition-colors hover:border-[var(--accent)]"
              >
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                  {link.source}
                </span>
                <span className="mt-1 block text-xs font-semibold text-[var(--text-primary)]">
                  {link.label}
                </span>
              </a>
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
          {loading ? "Loading free movies" : `${movies.length} playable movies`}
        </h3>
        {error && (
          <span className="text-xs font-semibold text-[var(--danger)]">
            Movie feed unavailable
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] animate-pulse rounded-2xl glass" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {movies.map((movie) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => playMovie(movie)}
              className={`glass group overflow-hidden rounded-2xl text-left transition-all hover:glow-border ${
                active.id === movie.id ? "ring-1 ring-[var(--accent)]" : ""
              }`}
            >
              <div className="relative aspect-[2/3] bg-black">
                <Image
                  src={movie.poster}
                  alt={`${movie.title} poster`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-widest ${platformClasses(
                      movie.platform
                    )}`}
                  >
                    {movie.platform}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                    {movie.year}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">{movie.runtime}</p>
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-[var(--text-primary)]">
                  {movie.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-[var(--text-muted)]">
                  {movie.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl glass p-8 text-center text-sm text-[var(--text-muted)]">
          No movies matched that search. Try a broader title, genre, or source filter.
        </div>
      )}
    </section>
  );
}
