"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import type { NewsItem } from "@/lib/types";

interface Briefing {
  date: string;
  topStories: NewsItem[];
  business: NewsItem[];
  markets: NewsItem[];
  startupsFintech: NewsItem[];
  security: NewsItem[];
  technology: NewsItem[];
  sourceCount: number;
}

function Section({ title, items }: { title: string; items: NewsItem[] }) {
  if (!items?.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-[var(--accent)]">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <NewsCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/briefings/daily")
      .then((r) => r.json())
      .then((d: Briefing) => setBriefing(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <Header title="Daily Briefing" subtitle="Africa Today" />
      <section className="mx-auto max-w-6xl px-4 py-6 space-y-8">
        <div className="rounded-3xl glass-strong p-6 fade-up">
          <h2 className="font-display text-2xl font-bold">
            <span className="brand-nexus">Africa</span>{" "}
            <span className="brand-wire">Today</span>
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {loading
              ? "Assembling today's briefing…"
              : briefing
                ? `${new Date(briefing.date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · ${briefing.sourceCount} sources`
                : "Briefing unavailable."}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 animate-pulse rounded-2xl glass" />
            ))}
          </div>
        ) : briefing ? (
          <>
            <Section title="Top 10 Stories Today" items={briefing.topStories} />
            <Section title="Business & Markets" items={[...briefing.business, ...briefing.markets]} />
            <Section title="Startup & Fintech Watch" items={briefing.startupsFintech} />
            <Section title="Technology" items={briefing.technology} />
            <Section title="Security Alerts" items={briefing.security} />
          </>
        ) : (
          <div className="rounded-2xl glass p-12 text-center text-[var(--text-muted)]">
            Could not load today&apos;s briefing.
          </div>
        )}
      </section>
    </main>
  );
}
