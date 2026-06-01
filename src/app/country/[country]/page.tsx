"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/Header";
import { FilteredFeed } from "@/components/FilteredFeed";
import { countryBySlug } from "@/lib/taxonomy";
import Link from "next/link";

const SECTIONS = ["Top Stories", "Politics", "Business", "Health", "Technology", "Security", "Video News"];

export default function CountryPage() {
  const params = useParams<{ country: string }>();
  const def = countryBySlug(params.country);
  const [section, setSection] = useState("Top Stories");

  if (!def) {
    return (
      <main>
        <Header title="Country" subtitle="Not Found" />
        <div className="mx-auto max-w-3xl px-4 py-12 text-center text-[var(--text-muted)]">
          <p>Unknown country.</p>
          <Link href="/" className="btn-primary inline-block mt-4">Back to Wire</Link>
        </div>
      </main>
    );
  }

  const query =
    section === "Top Stories"
      ? `country=${encodeURIComponent(def.name)}`
      : `country=${encodeURIComponent(def.name)}&category=${encodeURIComponent(section)}`;

  return (
    <main>
      <Header title={`${def.flag} ${def.name}`} subtitle={`${def.region} · Country Desk`} />
      <section className="mx-auto max-w-6xl px-4 py-6 space-y-5">
        <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
          {SECTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSection(s)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-[11px] font-bold tracking-wider uppercase transition-all ${
                section === s
                  ? "bg-[var(--accent)] text-[#030508]"
                  : "glass text-[var(--text-muted)] hover:text-[var(--accent)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <FilteredFeed
          query={query}
          emptyText={`No ${section} stories for ${def.name} right now. Try another section.`}
        />
      </section>
    </main>
  );
}
