"use client";

import { BrandLogo } from "@/components/BrandLogo";

export function BrandHero() {
  function replayIntro() {
    try {
      sessionStorage.removeItem("nexuswire-intro-seen");
    } catch {
      /* ignore */
    }
    window.location.reload();
  }
  return (
    <section className="brand-hero relative mx-auto max-w-6xl px-4 pt-6 pb-2">
      <div className="brand-hero-panel glass-strong overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo variant="hero" showTagline href={null} />
          <div className="max-w-md text-center sm:text-right">
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              Global wire aggregation, live video feeds, journalist desks, and broadcast
              scheduling — built for premium newsrooms.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-end">
              <span className="chip chip-rss">RSS Wires</span>
              <span className="chip chip-youtube">Live Video</span>
              <span className="chip" style={{ color: "var(--gold)", borderColor: "rgba(212,168,83,0.35)" }}>
                Premium Desk
              </span>
            </div>
            <button
              type="button"
              onClick={replayIntro}
              className="mt-4 text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase transition-colors hover:text-[var(--gold)]"
            >
              ↻ Replay brand intro
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
