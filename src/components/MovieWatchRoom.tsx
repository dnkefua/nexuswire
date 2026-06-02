"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type MoviePlatform = "Web" | "YouTube";

type MoviePick = {
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
};

const movies: MoviePick[] = [
  {
    id: "night-of-the-living-dead",
    title: "Night of the Living Dead",
    year: "1968",
    platform: "Web",
    source: "Internet Archive",
    genre: "Horror",
    runtime: "96 min",
    rights: "Public domain",
    description:
      "George A. Romero's landmark independent horror film follows a group trapped in a farmhouse as the modern zombie genre takes shape.",
    poster: "https://archive.org/services/img/night-of-the-living-dead-1968",
    embedUrl: "https://archive.org/embed/night-of-the-living-dead-1968",
    sourceUrl: "https://archive.org/details/night-of-the-living-dead-1968",
  },
  {
    id: "his-girl-friday-youtube",
    title: "His Girl Friday",
    year: "1940",
    platform: "YouTube",
    source: "Retrospective - Classic Movies",
    genre: "Comedy",
    runtime: "92 min",
    rights: "Public domain",
    description:
      "A machine-gun newsroom comedy with Cary Grant and Rosalind Russell trading deadlines, schemes, and sparks.",
    poster: "https://i.ytimg.com/vi/kmYcT5gT6a4/hqdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/kmYcT5gT6a4?rel=0",
    sourceUrl: "https://www.youtube.com/watch?v=kmYcT5gT6a4",
  },
  {
    id: "charade",
    title: "Charade",
    year: "1963",
    platform: "Web",
    source: "Internet Archive",
    genre: "Mystery comedy",
    runtime: "113 min",
    rights: "Public domain film",
    description:
      "Audrey Hepburn and Cary Grant move through Paris in a stylish blend of romance, comedy, suspense, and mistaken identity.",
    poster:
      "https://archive.org/services/img/charade-1963-cary-grant-audrey-hepburn-comedy-mystery-romance-thriller-full-movie",
    embedUrl:
      "https://archive.org/embed/charade-1963-cary-grant-audrey-hepburn-comedy-mystery-romance-thriller-full-movie",
    sourceUrl:
      "https://archive.org/details/charade-1963-cary-grant-audrey-hepburn-comedy-mystery-romance-thriller-full-movie",
  },
  {
    id: "the-general",
    title: "The General",
    year: "1926",
    platform: "Web",
    source: "Internet Archive",
    genre: "Silent action",
    runtime: "75 min",
    rights: "Public domain",
    description:
      "Buster Keaton's locomotive chase masterpiece is lean, visual, and still astonishingly precise almost a century later.",
    poster: "https://archive.org/services/img/TheGeneral",
    embedUrl: "https://archive.org/embed/TheGeneral",
    sourceUrl: "https://archive.org/details/TheGeneral",
  },
  {
    id: "sita-sings-the-blues",
    title: "Sita Sings the Blues",
    year: "2008",
    platform: "Web",
    source: "Internet Archive",
    genre: "Animation",
    runtime: "82 min",
    rights: "Creator-released",
    description:
      "Nina Paley's vivid animated feature connects the Ramayana, jazz vocals, and a modern breakup into one singular independent film.",
    poster: "https://archive.org/services/img/Sita_Sings_the_Blues",
    embedUrl: "https://archive.org/embed/Sita_Sings_the_Blues",
    sourceUrl: "https://archive.org/details/Sita_Sings_the_Blues",
  },
  {
    id: "plan-9",
    title: "Plan 9 from Outer Space",
    year: "1959",
    platform: "Web",
    source: "Internet Archive",
    genre: "Sci-fi",
    runtime: "79 min",
    rights: "Public domain",
    description:
      "Ed Wood's cult science-fiction oddity has aliens, graveyards, flying saucers, and a permanent place in midnight-movie history.",
    poster: "https://archive.org/services/img/plan-9-from-outer-space-1959_ed-wood",
    embedUrl: "https://archive.org/embed/plan-9-from-outer-space-1959_ed-wood",
    sourceUrl: "https://archive.org/details/plan-9-from-outer-space-1959_ed-wood",
  },
  {
    id: "detour",
    title: "Detour",
    year: "1945",
    platform: "Web",
    source: "Internet Archive",
    genre: "Film noir",
    runtime: "68 min",
    rights: "Public domain",
    description:
      "A grim, efficient noir about a drifter, a dead man, and one of classic cinema's most poisonous chance encounters.",
    poster: "https://archive.org/services/img/detour-1945",
    embedUrl: "https://archive.org/embed/detour-1945",
    sourceUrl: "https://archive.org/details/detour-1945",
  },
  {
    id: "the-stranger",
    title: "The Stranger",
    year: "1946",
    platform: "Web",
    source: "Internet Archive",
    genre: "Thriller",
    runtime: "95 min",
    rights: "Public domain",
    description:
      "Orson Welles directs and stars in a tense postwar thriller about a hidden Nazi fugitive living under a new identity.",
    poster: "https://archive.org/services/img/the_stranger_1946",
    embedUrl: "https://archive.org/embed/the_stranger_1946",
    sourceUrl: "https://archive.org/details/the_stranger_1946",
  },
];

const filters: Array<"All" | MoviePlatform> = ["All", "Web", "YouTube"];

const discoveryLinks = [
  {
    label: "TikTok public-domain clips",
    href: "https://www.tiktok.com/tag/publicdomainmovies",
    source: "TikTok",
  },
  {
    label: "YouTube public-domain search",
    href: "https://www.youtube.com/results?search_query=public+domain+movies+full+movie",
    source: "YouTube",
  },
];

function platformClasses(platform: MoviePlatform): string {
  if (platform === "YouTube") return "border-red-400/30 bg-red-500/10 text-red-100";
  return "border-[var(--gold)]/35 bg-[var(--gold)]/10 text-[var(--gold-bright)]";
}

export function MovieWatchRoom() {
  const [activeId, setActiveId] = useState(movies[0].id);
  const [filter, setFilter] = useState<"All" | MoviePlatform>("All");
  const active = movies.find((movie) => movie.id === activeId) || movies[0];
  const visibleMovies = useMemo(
    () => movies.filter((movie) => filter === "All" || movie.platform === filter),
    [filter]
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 pb-28">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-2xl glow-border">
          <div className="relative aspect-video bg-black">
            <iframe
              key={active.id}
              title={active.title}
              src={active.embedUrl}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="eager"
            />
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
            Watch desk
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            Select a poster to play the movie inside NexusWire. The catalogue favors
            public-domain archives, creator-released films, and embeddable legal sources.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {filters.map((nextFilter) => (
              <button
                key={nextFilter}
                type="button"
                onClick={() => setFilter(nextFilter)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
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
            TikTok is handled as short-form discovery, not unauthorized full-movie hosting.
            Full movies stay on verified embeddable sources.
          </div>
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleMovies.map((movie) => (
          <button
            key={movie.id}
            type="button"
            onClick={() => setActiveId(movie.id)}
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
    </section>
  );
}
