import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Free Movies | NexusWire",
  description:
    "Curated free-to-watch, public-domain, and rights-cleared movies from official web archives, YouTube, and TikTok discovery feeds.",
};

type Platform = "Web" | "YouTube" | "TikTok";

type MoviePick = {
  title: string;
  year: string;
  platform: Platform;
  source: string;
  genre: string;
  runtime: string;
  rights: string;
  description: string;
  href: string;
  cta: string;
};

const movies: MoviePick[] = [
  {
    title: "Night of the Living Dead",
    year: "1968",
    platform: "Web",
    source: "Internet Archive",
    genre: "Horror",
    runtime: "96 min",
    rights: "Public-domain classic",
    description:
      "George A. Romero's influential independent horror film, curated through a public archive listing.",
    href: "https://archive.org/details/night_of_the_living_dead",
    cta: "Watch archive",
  },
  {
    title: "His Girl Friday",
    year: "1940",
    platform: "Web",
    source: "Internet Archive",
    genre: "Comedy",
    runtime: "92 min",
    rights: "Public-domain classic",
    description:
      "A rapid-fire newsroom comedy pairing Cary Grant and Rosalind Russell in one of the great press-room films.",
    href: "https://archive.org/details/HisGirlFriday",
    cta: "Watch archive",
  },
  {
    title: "The General",
    year: "1926",
    platform: "Web",
    source: "Internet Archive",
    genre: "Silent action",
    runtime: "75 min",
    rights: "Public-domain classic",
    description:
      "Buster Keaton's locomotive chase masterpiece, still sharp, physical, and beautifully engineered.",
    href: "https://archive.org/details/TheGeneral",
    cta: "Watch archive",
  },
  {
    title: "Charade",
    year: "1963",
    platform: "Web",
    source: "Internet Archive",
    genre: "Mystery comedy",
    runtime: "113 min",
    rights: "Public-domain classic",
    description:
      "A stylish Audrey Hepburn and Cary Grant thriller with romance, identity games, and Parisian momentum.",
    href: "https://archive.org/details/charade",
    cta: "Watch archive",
  },
  {
    title: "Plan 9 from Outer Space",
    year: "1959",
    platform: "Web",
    source: "Internet Archive",
    genre: "Sci-fi",
    runtime: "79 min",
    rights: "Public-domain classic",
    description:
      "Ed Wood's cult science-fiction oddity, preserved as a midnight-movie favorite.",
    href: "https://archive.org/details/Plan_9_from_Outer_Space_1959",
    cta: "Watch archive",
  },
  {
    title: "Sita Sings the Blues",
    year: "2008",
    platform: "Web",
    source: "Official film site",
    genre: "Animation",
    runtime: "82 min",
    rights: "Creator-released free film",
    description:
      "Nina Paley's acclaimed animated feature, released by its creator for free online viewing.",
    href: "https://www.sitasingstheblues.com/watch.html",
    cta: "Watch official",
  },
  {
    title: "Public Domain Movies",
    year: "Live index",
    platform: "YouTube",
    source: "YouTube search",
    genre: "Mixed",
    runtime: "Varies",
    rights: "Verify uploader rights",
    description:
      "A YouTube discovery lane for classic titles and public-domain movie uploads from listed channels.",
    href: "https://www.youtube.com/results?search_query=public+domain+movies+full+movie",
    cta: "Search YouTube",
  },
  {
    title: "Classic Free Movies",
    year: "Live index",
    platform: "YouTube",
    source: "YouTube search",
    genre: "Classics",
    runtime: "Varies",
    rights: "Verify uploader rights",
    description:
      "A focused YouTube query for free classic films, useful when official archive embeds are unavailable.",
    href: "https://www.youtube.com/results?search_query=free+classic+movies+public+domain",
    cta: "Search YouTube",
  },
  {
    title: "Public Domain Movie Clips",
    year: "Live tag",
    platform: "TikTok",
    source: "TikTok tag",
    genre: "Short-form",
    runtime: "Clips",
    rights: "Discovery only",
    description:
      "A TikTok discovery feed for public-domain movie clips, restoration snippets, and creator commentary.",
    href: "https://www.tiktok.com/tag/publicdomainmovies",
    cta: "Open TikTok",
  },
  {
    title: "Silent Film Discovery",
    year: "Live search",
    platform: "TikTok",
    source: "TikTok search",
    genre: "Silent era",
    runtime: "Clips",
    rights: "Discovery only",
    description:
      "Short-form discovery for silent-era clips and film-history creators. Use source links to find full legal copies.",
    href: "https://www.tiktok.com/search?q=public%20domain%20silent%20film",
    cta: "Open TikTok",
  },
];

const platforms: Platform[] = ["Web", "YouTube", "TikTok"];

const libraries = [
  {
    name: "Internet Archive Feature Films",
    label: "Deep public archive",
    href: "https://archive.org/details/feature_films",
  },
  {
    name: "Library of Congress Film Collection",
    label: "Preservation research",
    href: "https://www.loc.gov/collections/?fa=partof:film,+video",
  },
  {
    name: "YouTube Public-Domain Discovery",
    label: "Channel and title search",
    href: "https://www.youtube.com/results?search_query=public+domain+full+movie",
  },
  {
    name: "TikTok Public-Domain Discovery",
    label: "Short-form discovery",
    href: "https://www.tiktok.com/search?q=public%20domain%20movies",
  },
];

function platformClasses(platform: Platform): string {
  if (platform === "YouTube") return "border-red-400/30 bg-red-500/10 text-red-200";
  if (platform === "TikTok") return "border-cyan-300/30 bg-cyan-400/10 text-cyan-100";
  return "border-[var(--gold)]/35 bg-[var(--gold)]/10 text-[var(--gold-bright)]";
}

export default function FreeMoviesPage() {
  return (
    <main>
      <Header title="Free Movies" subtitle="Rights-Cleared Cinema" />

      <section className="mx-auto max-w-6xl px-4 py-6 pb-28">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="glass-strong overflow-hidden rounded-2xl">
            <div className="border-b border-[var(--border)] p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                  Curated cinema
                </span>
                <span className="rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--gold-bright)]">
                  Free to watch
                </span>
              </div>
              <h2 className="mt-4 max-w-3xl font-display text-2xl font-bold uppercase tracking-[0.12em] text-[var(--text-primary)] sm:text-4xl">
                Public-domain and rights-cleared movies
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                A fast NexusWire watch desk for legal free films from web archives,
                YouTube discovery, and TikTok short-form discovery feeds.
              </p>
            </div>

            <div className="grid gap-px bg-[var(--border)] sm:grid-cols-3">
              {platforms.map((platform) => (
                <a
                  key={platform}
                  href={`#${platform.toLowerCase()}`}
                  className="bg-[var(--bg-panel)] px-5 py-4 transition-colors hover:bg-white/[0.04]"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    Platform
                  </p>
                  <p className="mt-1 font-display text-sm font-bold uppercase tracking-[0.12em]">
                    {platform}
                  </p>
                </a>
              ))}
            </div>
          </div>

          <aside className="glass rounded-2xl p-5">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold-bright)]">
              Source rule
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              This page only promotes archive links, creator-released films, or
              discovery searches where viewers can verify uploader rights before watching.
            </p>
            <div className="mt-5 space-y-2">
              {libraries.map((library) => (
                <a
                  key={library.name}
                  href={library.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-[var(--border)] bg-black/20 p-3 transition-colors hover:border-[var(--accent)]"
                >
                  <span className="block text-xs font-bold text-[var(--text-primary)]">
                    {library.name}
                  </span>
                  <span className="mt-1 block text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                    {library.label}
                  </span>
                </a>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-6 space-y-8">
          {platforms.map((platform) => (
            <section key={platform} id={platform.toLowerCase()} className="scroll-mt-24">
              <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                {platform} picks
              </h3>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {movies
                  .filter((movie) => movie.platform === platform)
                  .map((movie) => (
                    <article
                      key={`${movie.platform}-${movie.title}`}
                      className="glass group flex min-h-[300px] flex-col rounded-2xl p-4 transition-all hover:glow-border"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${platformClasses(
                            movie.platform
                          )}`}
                        >
                          {movie.platform}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                          {movie.year}
                        </span>
                      </div>

                      <div className="mt-5 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                          {movie.source}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold leading-snug text-[var(--text-primary)]">
                          {movie.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                          {movie.description}
                        </p>
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-4 text-[10px]">
                        <div>
                          <p className="uppercase tracking-widest text-[var(--text-muted)]">Genre</p>
                          <p className="mt-1 font-bold text-[var(--text-primary)]">{movie.genre}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-widest text-[var(--text-muted)]">Runtime</p>
                          <p className="mt-1 font-bold text-[var(--text-primary)]">{movie.runtime}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-widest text-[var(--text-muted)]">Rights</p>
                          <p className="mt-1 font-bold text-[var(--text-primary)]">{movie.rights}</p>
                        </div>
                      </div>

                      <a
                        href={movie.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-4 text-xs font-bold uppercase tracking-widest text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
                      >
                        {movie.cta}
                      </a>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
